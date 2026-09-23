#version 300 es
precision highp float;
// Primary visual cortex: orientation-tuned responses. Hue encodes edge angle.
uniform sampler2D u_ret;
uniform vec2 u_res;
in vec2 v_uv;
out vec4 fragColor;
float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
vec3 hsv(float h, float s, float v) {
  vec3 k = vec3(1.0, 2.0 / 3.0, 1.0 / 3.0);
  vec3 p = abs(fract(vec3(h) + k) * 6.0 - 3.0);
  return v * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), s);
}
void main() {
  float L = 1.2;
  vec2 px = L / u_res;
  // Sobel on a slightly smoothed image (mip level 1)
  float tl = lum(textureLod(u_ret, v_uv + px * vec2(-1.0,  1.0), L).rgb);
  float t  = lum(textureLod(u_ret, v_uv + px * vec2( 0.0,  1.0), L).rgb);
  float tr = lum(textureLod(u_ret, v_uv + px * vec2( 1.0,  1.0), L).rgb);
  float l  = lum(textureLod(u_ret, v_uv + px * vec2(-1.0,  0.0), L).rgb);
  float r  = lum(textureLod(u_ret, v_uv + px * vec2( 1.0,  0.0), L).rgb);
  float bl = lum(textureLod(u_ret, v_uv + px * vec2(-1.0, -1.0), L).rgb);
  float b  = lum(textureLod(u_ret, v_uv + px * vec2( 0.0, -1.0), L).rgb);
  float br = lum(textureLod(u_ret, v_uv + px * vec2( 1.0, -1.0), L).rgb);
  float gx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
  float gy = (tl + 2.0 * t + tr) - (bl + 2.0 * b + br);
  float mag = length(vec2(gx, gy));
  // Edge orientation is perpendicular to the gradient; angles wrap at 180 degrees.
  float angle = atan(gy, gx) + 1.5707963;
  float hue = fract(angle / 3.14159265);
  float v = smoothstep(0.04, 0.35, mag);
  vec3 col = hsv(hue, 0.85, 1.0) * v;
  fragColor = vec4(col, 1.0);
}
