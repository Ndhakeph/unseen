#version 300 es
precision highp float;
// The retinal image: inverted by the lens, sharp only at the fovea, with a blind spot.
uniform sampler2D u_src;   // mipmapped source
uniform vec2 u_res;
uniform float u_flip;      // 0..1 rotation amount (1 = 180 degrees)
uniform float u_fovea;     // 0..1 strength of eccentricity falloff
uniform float u_hole;      // 0..1 blind spot visible as a hole
uniform float u_fill;      // 0..1 blind spot filled in
uniform vec2 u_fix;        // fixation point in uv (screen space)
uniform float u_time;
in vec2 v_uv;
out vec4 fragColor;

// Screen assumed to span roughly 40 degrees of visual field horizontally.
const float DEG = 1.0 / 40.0;

float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

void main() {
  float aspect = u_res.x / u_res.y;
  // Lens: rotate 180 degrees about the centre (animated).
  float ang = u_flip * 3.14159265;
  vec2 c = v_uv - 0.5;
  c.y /= aspect;
  vec2 r = vec2(c.x * cos(ang) - c.y * sin(ang), c.x * sin(ang) + c.y * cos(ang));
  r.y *= aspect;
  vec2 uv = r + 0.5;

  // Eccentricity from fixation, in "degrees" (screen-space, aspect corrected).
  vec2 d = v_uv - u_fix;
  d.y /= aspect;
  float ecc = length(d) / DEG;

  // Acuity falls off steeply outside ~2 degrees. Map to mip level.
  float lod = u_fovea * clamp((ecc - 1.5) * 0.28, 0.0, 5.5);
  vec3 col = textureLod(u_src, uv, lod).rgb;

  // Colour vision fades with eccentricity (cones are concentrated centrally).
  float sat = 1.0 - u_fovea * smoothstep(2.5, 16.0, ecc) * 0.93;
  float L = lum(col);
  col = mix(vec3(L), col, sat);
  // Periphery is slightly darker / lower contrast.
  col *= 1.0 - u_fovea * smoothstep(6.0, 30.0, ecc) * 0.25;

  // Blind spot: ~15 degrees to the temporal side of fixation, ~5.5 x 7.5 degrees.
  vec2 bc = u_fix + vec2(15.0 * DEG, 1.5 * DEG * aspect);
  vec2 bd = v_uv - bc;
  bd.y /= aspect;
  vec2 radii = vec2(2.75, 3.75) * DEG;
  float e = length(bd / radii);       // 1.0 on the ellipse edge
  float inside = 1.0 - smoothstep(0.85, 1.05, e);
  float blind = max(u_hole, u_fill);

  if (blind > 0.001 && inside > 0.001) {
    // Filled in: interpolate from a ring of samples just outside the edge.
    vec3 fill = vec3(0.0);
    float wsum = 0.0;
    float theta0 = atan(bd.y, bd.x);
    for (int i = 0; i < 12; i++) {
      float t = float(i) / 12.0 * 6.2831853;
      vec2 ring = bc + vec2(cos(t) * radii.x, sin(t) * radii.y * aspect) * 1.18;
      // sample in the same rotated space
      vec2 rc = ring - 0.5; rc.y /= aspect;
      vec2 rr = vec2(rc.x * cos(ang) - rc.y * sin(ang), rc.x * sin(ang) + rc.y * cos(ang));
      rr.y *= aspect;
      float dtheta = abs(mod(t - theta0 + 3.14159265, 6.2831853) - 3.14159265);
      float w = pow(1.0 - dtheta / 3.14159265, 3.0) + 0.05;
      // near the edge, favour the closest ring point; at the centre, average all
      w = mix(1.0, w, smoothstep(0.0, 1.0, e));
      vec3 s = textureLod(u_src, rr + 0.5, 3.5).rgb;
      float sl = lum(s);
      s = mix(vec3(sl), s, sat);
      fill += s * w; wsum += w;
    }
    fill /= wsum;
    vec3 hole = vec3(0.0);
    vec3 target = mix(hole, fill, u_fill / max(blind, 0.001));
    col = mix(col, target, inside * blind);
  }
  fragColor = vec4(col, 1.0);
}
