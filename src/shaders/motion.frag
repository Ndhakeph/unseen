#version 300 es
precision highp float;
// Motion pathway (MT/V5): responds only to change. Decaying trail via ping-pong.
uniform sampler2D u_ret;
uniform sampler2D u_prevRet;
uniform sampler2D u_prevMotion;
uniform vec2 u_res;
uniform float u_dt;
in vec2 v_uv;
out vec4 fragColor;
void main() {
  vec3 a = textureLod(u_ret, v_uv, 1.0).rgb;
  vec3 b = textureLod(u_prevRet, v_uv, 1.0).rgb;
  float diff = length(a - b) * 3.0;
  float prev = texture(u_prevMotion, v_uv).r;
  float decay = exp(-u_dt * 4.0);
  float m = max(min(diff, 1.0), prev * decay);
  fragColor = vec4(m, m, m, 1.0);
}
