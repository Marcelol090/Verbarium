# Verbarium V12: motion tools and clean mobile depth

Source brief: 18 open-source repositories for motion, and a compact Inter Tight mobile UI token system (November 2026).

## Tool choices (architecture before dependencies)

The app is **vanilla JavaScript + Vite**, not React. `motion` is already installed and used in `src/motion.js`. Do not migrate the app to React just to animate components; do not add a second animation engine without a concrete unresolved need.

| Work | First choice | Why | Explicitly not used by default |
|---|---|---|---|
| Hover, pressed, focus and quiet inset depth | CSS | Browser-native, deterministic, keyboard friendly | Anime.js for simple states |
| Route entrances and staggered cards | Motion for JavaScript (already installed) | Compositor-friendly short sequences and explicit scope | Motion for React |
| Answer feedback and award reveal | Motion + CSS state | Distinct positive/negative feedback; no full-page replay | Continuous confetti loops |
| Character illustration currently supplied as WebP | Static WebP in `object-fit:contain` slot | Avoid invented frames, texture deformation and clip artifacts | Fake puppet motion on limbs |
| Finished frame-by-frame Pip rig/visemes (future) | Lottie-web only if a verified JSON export exists | Vector animation frame timings; preserve mouth shapes | Guessing animation from static PNG |
| Education promo videos (offline, future) | Remotion Skills or Motion Canvas | React video or TypeScript canvas composition | Shipping runtime video tool into UI |
| Canvas-based authoring editor (future) | Konva / Two.js | Input-aware 2D scene editing | Using canvas for ordinary HTML buttons |
| Scene 3D (not planned) | Three.js or Blender prerenders | Dedicated GPU or prerender pipeline | Shipping Three.js for a flat mobile card |
| GIF export (not UI runtime) | gifenc | Encoder from rendered frames | Presenting GIF as interactive control |

Other referenced options (Ola, Shifty, TweenJS, Manim, LUME, Godot, Babylon.js, Proton, Anime.js) are valid for their respective specializations, but are **not dependencies of V12**. Introducing 18 engines would increase transfer and debugging costs without improving the learning flow.

## Supplied design system, integrated responsibly

- Screen titles: `Inter Tight 600 22px/28px; letter-spacing:-0.7px`
- Section headers: `Inter Tight 600 19px/24px; letter-spacing:0.6px`
- Readable body: `Inter Tight 400 14.5px/18px; letter-spacing:0.3px`
- Mobile circular *utility controls*: visible 46×46 CSS px and keyboard-focus outline 3px. Larger lesson targets (minimum 48px) and the gameplay map nodes retain larger sizes.
- Cards: softened 14–18px radii and layered shadows; neutral edges use `--track` rather than conspicuous colored outlines.
- Main CTA: 6px soft inset highlight + two levels of outside depth; downstate moves 3px.
- Answer selection: keep 2px semantic strokes for selected, correct and incorrect states, even when cards have quiet edges.
- Primary text uses `--text`, supporting copy uses `--muted`, icons `--strong`; dividers use `--track`.
- Large screens keep the pre-existing V11 design contract. The mobile V12 is a non-destructive override.

## Motion contract

- **Tap:** 140ms CSS
- **Local feedback and steps:** 250–260ms Motion
- **Route reveal:** 320–380ms Motion, 35–40ms stagger only for visible elements
- **Geometry:** animate `opacity` on map nodes, **not transforms** on their absolute-positioned anchors; use transform/opacity on independent UI elements.
- **Reduced motion:** honor `prefers-reduced-motion: reduce` both in JS and CSS, no continuous looping.
- **Business logic:** animations must not change scores, access rules, lesson navigation, live progress, or voice behavior.

## References

- [Motion for JavaScript](https://motion.dev/docs/animate), [Motion's mini HTML/SVG engine](https://motion.dev/docs/quick-start)
- [Anime.js V4 timeline API](https://animejs.com/documentation/timeline)
- [Remotion Skills](https://www.remotion.dev/docs/ai/skills)
- [Lottie-web](https://github.com/airbnb/lottie-web)

V12 implements a coherent subset of the user's source material rather than indiscriminately installing its full list.
