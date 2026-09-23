import QRCode from 'qrcode';
import { createGL, createProgram, createTarget, destroyTarget, createTexture, pass } from './gl.js';
import { STAGES } from './stages.js';
import sourceFrag from './shaders/source.frag?raw';
import sceneFrag from './shaders/scene.frag?raw';
import retinaFrag from './shaders/retina.frag?raw';
import ganglionFrag from './shaders/ganglion.frag?raw';
import v1Frag from './shaders/v1.frag?raw';
import motionFrag from './shaders/motion.frag?raw';
import displayFrag from './shaders/display.frag?raw';

// Public URL shown in the QR code. Falls back to wherever the page is served from.
const SITE_URL = import.meta.env.VITE_SITE_URL || (location.origin + location.pathname);

const $ = (id) => document.getElementById(id);
const canvas = $('gl');
const video = $('cam');
const ui = { caption: $('caption'), label: $('label'), line: $('line'), science: $('science'), num: $('stageNum'),
  dots: $('dots'), more: $('moreBtn'), source: $('source'), toast: $('toast'), intro: $('intro'), start: $('startBtn'),
  qrUrl: $('qrUrl'), root: $('ui') };

let toastTimer = 0;
function toast(msg, ms = 2600) {
  ui.toast.textContent = msg; ui.toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => ui.toast.classList.remove('show'), ms);
}

// ---------- WebGL setup ----------
const gl = createGL(canvas);
if (!gl) {
  ui.intro.querySelector('.tagline').textContent = 'This browser cannot run WebGL2. Please try a recent Chrome, Safari, Edge or Firefox.';
  ui.start.style.display = 'none';
  throw new Error('WebGL2 unavailable');
}

const P = {
  source: createProgram(gl, sourceFrag),
  scene: createProgram(gl, sceneFrag),
  retina: createProgram(gl, retinaFrag),
  ganglion: createProgram(gl, ganglionFrag),
  v1: createProgram(gl, v1Frag),
  motion: createProgram(gl, motionFrag),
  display: createProgram(gl, displayFrag),
};

const videoTex = createTexture(gl, 2, 2);
let T = null; // render targets
let W = 0, H = 0;

function allocTargets() {
  if (T) Object.values(T).flat().forEach((t) => destroyTarget(gl, t));
  T = {
    scene: createTarget(gl, W, H),
    src: createTarget(gl, W, H, { mip: true }),
    ret: [createTarget(gl, W, H, { mip: true }), createTarget(gl, W, H, { mip: true })],
    gang: createTarget(gl, W, H),
    v1: createTarget(gl, W, H),
    mot: [createTarget(gl, W, H), createTarget(gl, W, H)],
  };
  // Clear everything so no garbage flashes.
  Object.values(T).flat().forEach((t) => { gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); });
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function resize() {
  const maxPixels = 1920 * 1080;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
  if (w * h > maxPixels) { const s = Math.sqrt(maxPixels / (w * h)); w = Math.round(w * s); h = Math.round(h * s); }
  if (w === W && h === H) return;
  W = w; H = h; canvas.width = W; canvas.height = H;
  allocTargets();
}
resize();
addEventListener('resize', resize);

// ---------- Camera with bulletproof fallback ----------
let camReady = false;
let camState = 'pending'; // pending | live | fallback
function setSource(state, msg) {
  camState = state;
  ui.source.textContent = state === 'live' ? 'live camera · nothing leaves this device' : 'generated scene · camera unavailable';
  if (msg) toast(msg);
}
async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) { setSource('fallback', 'No camera API here. Showing a generated scene.'); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 60, max: 60 } }, audio: false,
    });
    video.srcObject = stream;
    await video.play().catch(() => {});
    await new Promise((res) => { if (video.readyState >= 2) res(); else video.onloadeddata = () => res(); });
    camReady = true; setSource('live');
    stream.getVideoTracks()[0]?.addEventListener('ended', () => { camReady = false; setSource('fallback', 'Camera stopped. Showing a generated scene.'); });
  } catch (err) {
    console.warn('Camera unavailable, using fallback scene:', err?.name || err);
    setSource('fallback', 'Camera unavailable. Showing a generated scene instead.');
  }
}

// ---------- State ----------
let stage = 0;
const cur = { flip: 0, fovea: 0, hole: 0, fill: 0, w: [1, 0, 0, 0], showFix: 0 };
const fix = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
let frame = 0, lastT = performance.now(), start = lastT;
let started = false;
let autoplay = false, autoTimer = 0;
function setAutoplay(on) {
  autoplay = on; clearInterval(autoTimer);
  if (on) autoTimer = setInterval(() => setStage(stage + 1), 7000);
  document.body.classList.toggle('autoplay', on);
  toast(on ? 'Auto-play on · advances every 7 s' : 'Auto-play off');
}
function manual() { if (autoplay) setAutoplay(false); }

function setStage(i, { silent = false } = {}) {
  const n = STAGES.length;
  stage = ((i % n) + n) % n;
  const s = STAGES[stage];
  ui.caption.classList.add('swap');
  setTimeout(() => {
    ui.label.textContent = s.label; ui.line.textContent = s.line; ui.science.textContent = s.science;
    ui.num.textContent = `${stage} / ${n - 1}`;
    ui.caption.classList.remove('swap');
  }, silent ? 0 : 320);
  [...ui.dots.children].forEach((d, k) => d.classList.toggle('active', k === stage));
  $('progress').style.transform = `scaleX(${(stage + 1) / n})`;
  history.replaceState(null, '', stage ? '#' + stage : location.pathname);
  document.body.dataset.stage = s.id;
}
STAGES.forEach((s, k) => {
  const b = document.createElement('button'); b.title = s.label; b.addEventListener('click', (e) => { e.stopPropagation(); setStage(k); });
  ui.dots.appendChild(b);
});
setStage(parseInt(location.hash.slice(1), 10) || 0, { silent: true });

ui.more.addEventListener('click', (e) => { e.stopPropagation(); ui.caption.classList.toggle('open'); });

// ---------- Input ----------
let down = null;
const pointerTarget = document.body;
pointerTarget.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; moveFix(e); });
pointerTarget.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || down) moveFix(e); });
pointerTarget.addEventListener('pointerup', (e) => {
  if (!down) return;
  const dx = e.clientX - down.x, dy = e.clientY - down.y, dt = performance.now() - down.t;
  down = null;
  if (!started) return;
  if (e.target.closest('button, .more, .dots')) return;
  if (dt < 350 && Math.hypot(dx, dy) < 10) { manual(); setStage(stage + 1); }
});
function moveFix(e) { fix.tx = e.clientX / innerWidth; fix.ty = 1 - e.clientY / innerHeight; }

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  if (!started && (k === ' ' || k === 'Enter')) { begin(); return; }
  if (k === 'ArrowRight' || k === ' ' || k === 'ArrowDown' || k === 'PageDown') { e.preventDefault(); manual(); setStage(stage + 1); }
  else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); manual(); setStage(stage - 1); }
  else if (k === 'a' || k === 'A') setAutoplay(!autoplay);
  else if (k === 'Home') setStage(0);
  else if (k === 'End') setStage(STAGES.length - 1);
  else if (/^[0-9]$/.test(k) && +k < STAGES.length) setStage(+k);
  else if (k === 'i' || k === 'I') ui.caption.classList.toggle('open');
  else if (k === 'p' || k === 'P') { document.body.classList.toggle('presenter'); toast(document.body.classList.contains('presenter') ? 'Presenter mode on' : 'Presenter mode off'); }
  else if (k === 'h' || k === 'H') ui.root.classList.toggle('hidden');
  else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.().catch(() => {}); }
  else if (k === 'Escape') ui.caption.classList.remove('open');
});

function begin() {
  if (started) return;
  started = true;
  ui.intro.classList.add('hidden');
  startCamera();
}
ui.start.addEventListener('click', begin);

// ---------- QR ----------
ui.qrUrl.textContent = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
QRCode.toCanvas($('qrCanvas'), SITE_URL, { margin: 1, width: 256, color: { dark: '#0a0a0dff', light: '#ffffffff' } }).catch(() => {});

// ---------- Render loop ----------
const ease = (a, b, k) => a + (b - a) * k;
function render(now) {
  requestAnimationFrame(render);
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  const time = (now - start) / 1000;
  const k = 1 - Math.exp(-dt * 5.5);
  const target = STAGES[stage].params;
  for (const key of ['flip', 'fovea', 'hole', 'fill', 'showFix']) cur[key] = ease(cur[key], target[key], k);
  for (let i = 0; i < 4; i++) cur.w[i] = ease(cur.w[i], target.w[i], k);
  const kf = 1 - Math.exp(-dt * 9);
  fix.x = ease(fix.x, fix.tx, kf); fix.y = ease(fix.y, fix.ty, kf);

  const i = frame & 1, j = 1 - i;
  frame++;

  // 1. Source: camera or generated scene, normalised to canvas size.
  let inputTex, inW, inH, flipY, mirror;
  if (camReady && video.readyState >= 2) {
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, videoTex);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video); } catch (_) { /* frame not ready */ }
    inputTex = videoTex; inW = video.videoWidth || 1280; inH = video.videoHeight || 720; flipY = 1; mirror = 1;
  } else {
    pass(gl, P.scene, T.scene, (u) => { u.f('u_time', time); u.v2('u_res', W, H); });
    inputTex = T.scene.tex; inW = W; inH = H; flipY = 0; mirror = 0;
  }
  pass(gl, P.source, T.src, (u) => { u.tex('u_video', inputTex); u.v2('u_res', W, H); u.v2('u_videoRes', inW, inH); u.f('u_mirror', mirror); u.f('u_flipY', flipY); });

  // 2. Retina.
  pass(gl, P.retina, T.ret[i], (u) => {
    u.tex('u_src', T.src.tex); u.v2('u_res', W, H); u.f('u_flip', cur.flip); u.f('u_fovea', cur.fovea);
    u.f('u_hole', cur.hole); u.f('u_fill', cur.fill); u.v2('u_fix', fix.x, fix.y); u.f('u_time', time);
  });
  // 3. Ganglion cells, 4. V1, 5. Motion (skip pathways that are invisible).
  if (cur.w[1] > 0.002) pass(gl, P.ganglion, T.gang, (u) => { u.tex('u_ret', T.ret[i].tex); u.v2('u_res', W, H); });
  if (cur.w[2] > 0.002) pass(gl, P.v1, T.v1, (u) => { u.tex('u_ret', T.ret[i].tex); u.v2('u_res', W, H); });
  pass(gl, P.motion, T.mot[i], (u) => { u.tex('u_ret', T.ret[i].tex); u.tex('u_prevRet', T.ret[j].tex); u.tex('u_prevMotion', T.mot[j].tex); u.v2('u_res', W, H); u.f('u_dt', dt); });
  // 6. Composite to screen.
  pass(gl, P.display, null, (u) => {
    u.tex('u_ret', T.ret[i].tex); u.tex('u_gang', T.gang.tex); u.tex('u_v1', T.v1.tex); u.tex('u_motion', T.mot[i].tex);
    u.v4('u_w', cur.w[0], cur.w[1], cur.w[2], cur.w[3]); u.v2('u_res', W, H); u.v2('u_fix', fix.x, fix.y);
    u.f('u_showFix', cur.showFix); u.f('u_vignette', 0.45); u.f('u_time', time);
  });
}
requestAnimationFrame(render);
