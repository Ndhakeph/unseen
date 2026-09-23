# Unseen

**"See yourself the way your brain actually receives you, before it cleans up the picture."**

Unseen is a browser webcam mirror that runs your live image through a physiologically grounded, stage-by-stage approximation of the human visual system. Step through each stage of vision — from the inverted image on your retina to the stable, edited world you actually perceive — and watch your brain's editing get undone, then redone.

<!-- Replace with a live-camera screenshot at docs/screenshot.png (current image shows the generated fallback scene) -->
![Unseen screenshot](docs/screenshot.png)

## Stages

| Stage | What you see | The science |
| --- | --- | --- |
| 0. Mirror | The seamless picture you believe you see. | This is the end product your brain hands you, not what your eyes actually capture. |
| 1. Lens | The image is upside down and back to front. | The eye's lens projects a rotated image onto the retina. Nothing later flips it back as a picture; the brain simply learns to act on it correctly. |
| 2. Fovea | Only a tiny central spot (~2°, about a thumb's width at arm's length) is sharp and in full colour; everything else fades fast. | Sharp, colour-rich vision is concentrated in the fovea, and acuity drops steeply as you move away from your point of fixation. |
| 3. Blind spot | A hole in the image, roughly 12–15° to the temporal side. | There are no photoreceptors where the optic nerve exits the eye, so that patch of your visual field is never captured at all. |
| 4. Filling in | The hole disappears, patched from its surroundings. | Your brain interpolates the blind spot from nearby texture and colour, which is why you never notice it in daily life. |
| 5. Ganglion cells | The scene reduces to contrast and edges instead of a smooth photo. | About 100 million photoreceptors compress into roughly 1.2 million optic-nerve fibres via ganglion cells with centre-surround receptive fields, so the eye transmits contrast and edges, not pixels. |
| 6. V1 | The image decomposes into oriented edges, colour-coded by angle. | Neurons in the primary visual cortex (V1) are tuned to specific line orientations, a finding first shown by Hubel and Wiesel. |
| 7. Motion | Hold still and you fade away. | A dorsal-stream area (MT/V5) responds mainly to change and motion, so an unmoving scene gives it little to report. |
| 8. Reconstruction | A stable, complete, right-way-up world. | The brain integrates all of the above into the seamless picture you call "seeing." |

## Controls

- `→` / `←` or `Space` — step through stages; tap or click also advances
- `0`–`8` — jump directly to a stage
- `i` — toggle the science panel (deeper explanation)
- `f` — fullscreen
- `p` — presenter mode (bigger type)
- Pointer or touch — moves the fixation point
- A QR code to the live site is always on screen for audience phones

## Run locally

```
npm install
npm run dev
```

## Deploy

Push to GitHub and import the repo into Vercel — zero config, Vite is auto-detected — or run `npx vercel`. It is a fully static site: no backend, no API keys, no tracking. If the camera is denied or unavailable, it falls back to a generated animated scene.

## Honesty note

This is an approximation for intuition, not a simulation. Eccentricity blur uses mipmap levels rather than measured acuity curves; ganglion cells are modelled as a single difference-of-Gaussians scale; V1 is shown as a gradient-orientation map, not a Gabor filter bank; and the fill-in is local averaging. Real numbers are approximate and vary between people.

## Sources

- Curcio, C. A., Sloan, K. R., Kalina, R. E., & Hendrickson, A. E. (1990). Human photoreceptor topography. *Journal of Comparative Neurology*, 292(4), 497–523. (~92 million rods, ~4.6 million cones)
- Hubel, D. H., & Wiesel, T. N. (1962). Receptive fields, binocular interaction and functional architecture in the cat's visual cortex. *Journal of Physiology*, 160(1), 106–154.
- Kuffler, S. W. (1953). Discharge patterns and functional organization of mammalian retina. *Journal of Neurophysiology*, 16(1), 37–68. (centre-surround receptive fields)
- Rodieck, R. W. (1965). Quantitative analysis of cat retinal ganglion cell response to visual stimuli. *Vision Research*, 5(11), 583–601. (difference-of-Gaussians model)
- Ramachandran, V. S., & Gregory, R. L. (1991). Perceptual filling in of artificially induced scotomas in human vision. *Nature*, 350, 699–702.
- Wandell, B. A. (1995). *Foundations of Vision*. Sinauer. (optic nerve ~1 million fibres; blind spot geometry)

---

Built in ~60 minutes at the Claude Fable 5.1 Build Day, Mumbai, 23 Sep 2026, with Claude Code.

Stack: Vite, vanilla JavaScript, WebGL2 (GLSL ES 3.00), no frameworks.
