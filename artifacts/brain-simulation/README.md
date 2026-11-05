# Neural Bloom — solid white living morph

Self-contained animated SVG, nominal size 960 × 640, with a transparent background. All visible lines, points and numbers are fully opaque white. Geist Mono is embedded; its license is included.

The 32-second loop rotates and smoothly morphs between neural fibers, EEG-inspired signals, particles and numerical orbits. Fibers bend internally, pulses travel along them, and particles move through the field. Thirteen numerical readouts remain present through every phase and update twice a second.

Transitions interpolate the geometry with smooth acceleration and deceleration. Strands contract to solid points in the particle phase and expand into the next form. There are no opacity attributes or fade animations. Text visibility switches discretely only to refresh individual numerical values.

Open `preview.html` to play, pause, select a phase or change the preview background. The standalone SVG animates natively without JavaScript or external dependencies. File size is approximately 9.4 MB. Raster exports and some vector editors show only a still frame.

```html
<img src="neural-bloom.svg" alt="Animated white neural signal field" width="960" height="640" />
```

Numbers and EEG-inspired traces are illustrative. `generate.py` is the editable generator; run from the project root. Earlier versions and generators are preserved with version suffixes.
