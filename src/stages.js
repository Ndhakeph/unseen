// Stage definitions. `params` are targets that the renderer eases toward.
// w = [image, ganglion, v1, motion]
export const STAGES = [
  {
    id: 'mirror', label: 'What you think you see',
    line: 'A seamless, sharp, colourful picture. This is not what your eye sends.',
    science: 'Your experience of vision is a finished product. Everything that follows is what actually travels from your eyes toward your brain, stage by stage. Each stage is an approximation built for intuition, not a simulation.',
    params: { flip: 0, fovea: 0, hole: 0, fill: 0, w: [1, 0, 0, 0], showFix: 0 },
  },
  {
    id: 'lens', label: 'The lens',
    line: 'The image on your retina is upside down and back to front.',
    science: 'Light crosses inside the eye, so the lens projects a rotated image onto the retina, like a camera. Nothing later "flips it back" as a picture. The brain simply learns to act on it correctly.',
    params: { flip: 1, fovea: 0, hole: 0, fill: 0, w: [1, 0, 0, 0], showFix: 0 },
  },
  {
    id: 'fovea', label: 'The fovea',
    line: 'Only a thumb-sized spot is sharp and in colour. Move the pointer.',
    science: 'Sharp, colour vision covers about 2 degrees of view, roughly a thumbnail at arm\'s length. Cones crowd the fovea; rods dominate the periphery, where acuity and colour fall away steeply. You never notice because your eyes jump several times a second (Curcio et al., 1990: ~92 million rods, ~4.6 million cones).',
    params: { flip: 1, fovea: 1, hole: 0, fill: 0, w: [1, 0, 0, 0], showFix: 1 },
  },
  {
    id: 'blind', label: 'The blind spot',
    line: 'There is a hole where the optic nerve leaves the eye.',
    science: 'Where the optic nerve exits there are no photoreceptors at all: a gap about 5.5 by 7.5 degrees, roughly 15 degrees to the side of where you look. You do not see black there. You see nothing, and there is no one to notice.',
    params: { flip: 1, fovea: 1, hole: 1, fill: 0, w: [1, 0, 0, 0], showFix: 1 },
  },
  {
    id: 'fill', label: 'Filling in',
    line: 'Your brain paints over the hole with whatever surrounds it.',
    science: 'Perceptual filling-in: cortex interpolates the missing region from its neighbours, so patterns and colours appear continuous (Ramachandran & Gregory, 1991). Here it is approximated by blending in a ring of surrounding samples.',
    params: { flip: 1, fovea: 1, hole: 0, fill: 1, w: [1, 0, 0, 0], showFix: 1 },
  },
  {
    id: 'ganglion', label: 'Retinal ganglion cells',
    line: 'The nerve carries contrast and edges, not pixels.',
    science: 'About a hundred million photoreceptors squeeze into roughly 1.2 million optic-nerve fibres. Each ganglion cell compares a small centre against its surround, a difference of Gaussians (Kuffler, 1953; Rodieck, 1965). Bright means ON-centre cells firing, dark means OFF-centre cells firing. Flat regions send almost nothing.',
    params: { flip: 1, fovea: 1, hole: 0, fill: 1, w: [0, 1, 0, 0], showFix: 1 },
  },
  {
    id: 'v1', label: 'Visual cortex (V1)',
    line: 'Neurons in the cortex each respond to one edge angle.',
    science: 'Hubel and Wiesel (1962) found that neurons in primary visual cortex fire for edges at a particular orientation. Here every edge is coloured by its angle, so the scene becomes a map of orientations rather than an image.',
    params: { flip: 1, fovea: 1, hole: 0, fill: 1, w: [0, 0, 1, 0], showFix: 1 },
  },
  {
    id: 'motion', label: 'The motion pathway',
    line: 'One pathway sees only change. Hold still and you vanish.',
    science: 'A dorsal stream through area MT/V5 is tuned to motion rather than form. When nothing moves, it goes quiet. This is why a perfectly stabilised image on the retina fades from awareness.',
    params: { flip: 1, fovea: 1, hole: 0, fill: 1, w: [0, 0, 0, 1], showFix: 0 },
  },
  {
    id: 'reconstruct', label: 'The reconstruction',
    line: 'Your brain rebuilds all of it into the world you think you see.',
    science: 'From an inverted, mostly blurry, colour-poor signal with a hole in it, compressed into edges and change, the brain constructs a stable, complete, upright scene and presents it as simply "there". Seeing is an act of construction.',
    params: { flip: 0, fovea: 0, hole: 0, fill: 0, w: [1, 0, 0, 0], showFix: 0 },
  },
];
