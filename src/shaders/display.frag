#version 300 es
precision highp float;
// Final compositor: crossfades between pathway outputs according to stage weights.
uniform sampler2D u_ret;
uniform sampler2D u_gang;
uniform sampler2D u_v1;
uniform sampler2D u_motion;
uniform vec4 u_w;         // weights: image, ganglion, v1, motion (sum ~1)
uniform vec2 u_res;
uniform vec2 u_fix;
uniform float u_showFix;  // 0..1 draw the fixation marker
uniform float u_vignette;
uniform float u_time;
in vec2 v_uv;
out vec4 fragColor;
void main() {
  vec3 img = texture(u_ret, v_uv).rgb;
  vec3 gang = texture(u_gang, v_uv).rgb;
  vec3 v1 = texture(u_v1, v_uv).rgb;
  float m = texture(u_motion, v_uv).r;
  // Motion view: bright cyan-white where things change, deep dark elsewhere.
  vec3 mot = mix(vec3(0.02, 0.03, 0.05), vec3(0.75, 0.95, 1.0), smoothstep(0.02, 0.6, m));
  mot += img * m * 0.5;
  vec3 col = img * u_w.x + gang * u_w.y + v1 * u_w.z + mot * u_w.w;

  // Soft vignette for a museum feel.
  vec2 q = v_uv - 0.5;
  float vig = 1.0 - u_vignette * smoothstep(0.35, 0.9, length(q * vec2(1.0, 1.15)));
  col *= vig;

  // Fixation marker: thin ring.
  float aspect = u_res.x / u_res.y;
  vec2 d = v_uv - u_fix; d.y /= aspect;
  float dist = length(d);
  float ring = smoothstep(0.011, 0.0095, dist) * smoothstep(0.007, 0.0085, dist);
  col = mix(col, vec3(1.0), ring * u_showFix * 0.85);

  fragColor = vec4(col, 1.0);
}
