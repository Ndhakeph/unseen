#version 300 es
precision highp float;
// Retinal ganglion cells: centre-surround receptive fields (difference of Gaussians).
uniform sampler2D u_ret; // mipmapped retinal image
uniform vec2 u_res;
in vec2 v_uv;
out vec4 fragColor;
float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
void main() {
  float centre = lum(textureLod(u_ret, v_uv, 0.7).rgb);
  float surround = lum(textureLod(u_ret, v_uv, 3.2).rgb);
  float dog = centre - surround;           // ON-centre response (OFF is the negative)
  float on = max(dog, 0.0), off = max(-dog, 0.0);
  // Neutral grey field = "no signal". Bright = ON cells firing, dark = OFF cells firing.
  vec3 base = vec3(0.42, 0.43, 0.46);
  vec3 col = base + vec3(1.0, 0.97, 0.9) * on * 4.5 - vec3(0.9, 0.95, 1.0) * off * 4.5;
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
