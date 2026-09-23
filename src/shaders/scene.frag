#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_res;

in vec2 v_uv;
out vec4 fragColor;

vec3 hsv2rgb(vec3 c) {
    vec4 k = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + k.xyz) * 6.0 - k.www);
    return c.z * mix(k.xxx, clamp(p - k.xxx, 0.0, 1.0), c.y);
}

vec2 rot2(vec2 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

float discMask(vec2 p, vec2 c, float r) {
    float d = length(p - c) - r;
    float aa = fwidth(d) + 0.0005;
    return 1.0 - smoothstep(0.0, aa, d);
}

float ellipseMask(vec2 p, vec2 c, float rx, float ry) {
    vec2 q = (p - c) / vec2(max(rx, 0.0008), max(ry, 0.0008));
    float nd = length(q);
    float aa = fwidth(nd) + 0.0025;
    return 1.0 - smoothstep(1.0 - aa, 1.0 + aa, nd);
}

vec3 stripes(vec2 p, vec2 c, vec2 half_size, float ang, vec3 colA, vec3 colB, out float mask) {
    vec2 q = rot2(p - c, -ang);
    vec2 d = abs(q) - half_size;
    float bd = length(max(d, vec2(0.0, 0.0))) + min(max(d.x, d.y), 0.0);
    float aa = fwidth(bd) + 0.0006;
    mask = 1.0 - smoothstep(0.0, aa, bd);
    float sc = sin(q.x * 26.0);
    float t = smoothstep(-0.2, 0.2, sc);
    return mix(colA, colB, t);
}

void main() {
    float aspect = u_res.x / u_res.y;
    vec2 p = v_uv - vec2(0.5, 0.5);
    p.x *= aspect;
    float halfW = aspect * 0.5;
    float halfH = 0.5;
    float m = min(halfW, halfH);

    vec3 bgTop = vec3(0.055, 0.065, 0.11);
    vec3 bgBot = vec3(0.02, 0.025, 0.045);
    vec3 col = mix(bgBot, bgTop, v_uv.y);
    float vig = smoothstep(max(halfW, halfH) * 1.05, m * 0.2, length(p));
    col *= mix(0.65, 1.0, vig);
    col += 0.015 * vec3(sin(u_time * 0.05), sin(u_time * 0.05 + 2.0), sin(u_time * 0.05 + 4.0));

    vec2 boxHalf = vec2(m * 0.34, m * 0.18);
    vec2 c1 = vec2(-halfW + boxHalf.x * 1.05, halfH - boxHalf.y * 1.3);
    vec2 c2 = vec2(halfW - boxHalf.x * 1.05, -halfH + boxHalf.y * 1.3);
    float mask1;
    vec3 s1 = stripes(p, c1, boxHalf, 0.42, vec3(0.12, 0.20, 0.22), vec3(0.55, 0.70, 0.62), mask1);
    col = mix(col, s1, mask1);
    float mask2;
    vec3 s2 = stripes(p, c2, boxHalf, -0.35, vec3(0.22, 0.14, 0.10), vec3(0.75, 0.48, 0.30), mask2);
    col = mix(col, s2, mask2);

    float ringRadius = m * 0.62;
    float discR = m * 0.095;
    for (int i = 0; i < 8; i++) {
        float fi = float(i);
        float ang = fi * (6.28318530718 / 8.0) + u_time * 0.16;
        vec2 dc = vec2(cos(ang), sin(ang)) * ringRadius;
        float hue = fi / 8.0 + u_time * 0.015;
        vec3 dcol = hsv2rgb(vec3(fract(hue), 0.55, 0.92));
        float glowR = discR * 1.6;
        float glow = ellipseMask(p, dc, glowR, glowR);
        col = mix(col, dcol * 0.5, glow * 0.25);
        float dm = discMask(p, dc, discR);
        col = mix(col, dcol, dm);
    }

    vec2 faceCenter = vec2(sin(u_time * 0.07) * m * 0.14, cos(u_time * 0.05) * m * 0.08);
    float headMask = ellipseMask(p, faceCenter, m * 0.34, m * 0.30);
    col = mix(col, vec3(0.12, 0.12, 0.17), headMask * 0.5);

    float blinkT = mod(u_time, 4.2);
    float blink = smoothstep(0.0, 0.05, blinkT) * (1.0 - smoothstep(0.05, 0.16, blinkT));
    float eyeRy = mix(m * 0.075, m * 0.006, blink);
    vec2 eyeOff = vec2(m * 0.13, m * 0.04);
    vec3 eyeColor = vec3(0.92, 0.90, 0.85);
    float eyeL = ellipseMask(p, faceCenter + vec2(-eyeOff.x, eyeOff.y), m * 0.06, eyeRy);
    float eyeR = ellipseMask(p, faceCenter + vec2(eyeOff.x, eyeOff.y), m * 0.06, eyeRy);
    col = mix(col, eyeColor, eyeL);
    col = mix(col, eyeColor, eyeR);

    vec2 mouthC = faceCenter + vec2(0.0, -m * 0.05);
    float mouthR = m * 0.16;
    float mouthThick = m * 0.022;
    vec2 mq = p - mouthC;
    float ringD = abs(length(mq) - mouthR) - mouthThick;
    float aaMouth = fwidth(ringD) + 0.0006;
    float ringMask = 1.0 - smoothstep(0.0, aaMouth, ringD);
    float lowerMask = smoothstep(-m * 0.02, m * 0.05, -mq.y);
    float mouthMask = ringMask * lowerMask;
    col = mix(col, vec3(0.85, 0.42, 0.34), mouthMask);

    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
