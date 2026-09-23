// Stage definitions. `params` are targets that the renderer eases toward.
// w = [image, ganglion, v1, motion]
export const STAGES = [
  {
    id: 'mirror', label: 'This is you, as you think you see yourself',
    line: 'A smooth, sharp, colourful picture. Your eyes never send your brain anything like this. Press → or tap to follow the picture from your eye to your brain.',
    science: 'What you experience as "seeing" is a finished product. The next seven steps show, roughly, what actually travels from your eyes to your brain, and how much of it the brain has to rebuild. Every step is a simplified approximation made for intuition, not a simulation.',
    params: { flip: 0, fovea: 0, hole: 0, fill: 0, w: [1, 0, 0, 0], showFix: 0 },
  },
  {
    id: 'lens', label: 'Step 1 · Your eye flips the picture',
    line: 'Inside your eye, the picture lands upside down and back to front. Your brain never flips it back. It simply learns to use it this way.',
    science: 'Light rays cross as they pass through the lens, so the image on the retina at the back of the eye is rotated 180 degrees, just as in a camera. There is no later stage that turns it "the right way up" as a picture. The brain learns to act correctly on the rotated signal.',
    params: { flip: 1, fovea: 0, hole: 0, fill: 0, w: [1, 0, 0, 0], showFix: 0 },
  },
  {
    id: 'fovea', label: 'Step 2 · Only one small spot is sharp',
    line: 'Move your pointer or finger. Only the spot you look straight at is sharp and in colour. Everything else is blurry and almost grey.',
    science: 'The sharp, colourful part of your vision is about two degrees wide, roughly your thumbnail at arm\'s length. It comes from the fovea, a tiny pit at the centre of the retina packed with colour-sensing cones. Away from it, detail and colour fall off steeply. You never notice because your eyes jump to a new spot several times a second (Curcio et al., 1990: about 92 million rods, 4.6 million cones).',
    params: { flip: 1, fovea: 1, hole: 0, fill: 0, w: [1, 0, 0, 0], showFix: 1 },
  },
  {
    id: 'blind', label: 'Step 3 · There is a hole in your vision',
    line: 'Each eye has a blind patch where the nerve leaves it. Keep moving the pointer and watch the hole follow your gaze.',
    science: 'Where the optic nerve exits the eye there are no light-sensing cells at all: a gap about 5.5 by 7.5 degrees wide, roughly 15 degrees to the side of where you look. You do not see black there. You see nothing, and nothing is there to notice the absence.',
    params: { flip: 1, fovea: 1, hole: 1, fill: 0, w: [1, 0, 0, 0], showFix: 1 },
  },
  {
    id: 'fill', label: 'Step 4 · Your brain hides the hole',
    line: 'You have never seen your own blind spot. Your brain paints over it with whatever is around it.',
    science: 'This is called perceptual filling-in. The visual cortex interpolates the missing patch from its neighbours, so patterns, colours and backgrounds look continuous (Ramachandran & Gregory, 1991). Here it is approximated by blending in a ring of surrounding samples.',
    params: { flip: 1, fovea: 1, hole: 0, fill: 1, w: [1, 0, 0, 0], showFix: 1 },
  },
  {
    id: 'ganglion', label: 'Step 5 · Your eye sends outlines, not a photo',
    line: 'The nerve to your brain is far too thin to carry pixels. It sends only the places where light meets dark.',
    science: 'About a hundred million light-sensing cells squeeze into roughly 1.2 million nerve fibres. Each fibre comes from a ganglion cell that compares a small central patch against the ring around it, a "difference of Gaussians" (Kuffler, 1953; Rodieck, 1965). Warm white shows ON-centre cells firing, blue shows OFF-centre cells firing. Flat, even regions send almost nothing.',
    params: { flip: 1, fovea: 1, hole: 0, fill: 1, w: [0, 1, 0, 0], showFix: 1 },
  },
  {
    id: 'v1', label: 'Step 6 · Your brain sorts edges by angle',
    line: 'Cells at the back of your brain each fire for one tilt of line. Here every angle gets its own colour.',
    science: 'In primary visual cortex (V1), Hubel and Wiesel (1962) found neurons that respond only to edges at a particular orientation. This view colours every edge by its angle, so the scene becomes a map of orientations rather than an image.',
    params: { flip: 1, fovea: 1, hole: 0, fill: 1, w: [0, 0, 1, 0], showFix: 1 },
  },
  {
    id: 'motion', label: 'Step 7 · Another part sees only movement',
    line: 'Wave your hand. Now hold completely still. This pathway goes dark when nothing moves.',
    science: 'A separate stream through the brain area MT/V5 is tuned to motion rather than shape. When nothing changes, it goes quiet. This is why an image held perfectly still on the retina fades from awareness.',
    params: { flip: 1, fovea: 1, hole: 0, fill: 1, w: [0, 0, 0, 1], showFix: 0 },
  },
  {
    id: 'reconstruct', label: 'Step 8 · Your brain builds the picture you see',
    line: 'From an upside-down, blurry, colour-poor signal with a hole in it, your brain assembles the smooth, sharp, upright you. Seeing is something the brain makes.',
    science: 'None of the earlier stages is ever shown to you. The brain combines edges, colour, motion and memory into a stable, complete, right-way-up scene and presents it as simply "there". Press → to start again.',
    params: { flip: 0, fovea: 0, hole: 0, fill: 0, w: [1, 0, 0, 0], showFix: 0 },
  },
];
