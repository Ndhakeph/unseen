#version 300 es
precision highp float;
// Normalises the camera (or fallback scene) into a canvas-sized, mirrored, cover-fit texture.
uniform sampler2D u_video;
uniform vec2 u_res;      // output res
uniform vec2 u_videoRes; // input res
uniform float u_mirror;  // 1 = mirror horizontally
uniform float u_flipY;   // 1 = input is top-down (video textures)
in vec2 v_uv;
out vec4 fragColor;
void main() {
  vec2 uv = v_uv;
  if (u_mirror > 0.5) uv.x = 1.0 - uv.x;
  // cover fit
  float outA = u_res.x / u_res.y;
  float inA = u_videoRes.x / u_videoRes.y;
  vec2 s = vec2(1.0);
  if (inA > outA) s.x = outA / inA; else s.y = inA / outA;
  uv = (uv - 0.5) * s + 0.5;
  if (u_flipY > 0.5) uv.y = 1.0 - uv.y;
  fragColor = vec4(texture(u_video, uv).rgb, 1.0);
}
