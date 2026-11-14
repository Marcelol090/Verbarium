# Verbarium raster kit: 275 individually published WebP files

**235 source items + 40 independently exported active/disabled icon states**, with transparent edges and original artwork geometry.

The images live at `public/ui-kit/raster/<category>/<name>.webp`, **actually in GitHub**. Each file is a real Git blob. The source PNG package remains available separately; the website serves optimized WebP.

- `catalog.js`: 275 IDs, strict URL builder, accessible image renderer.
- `manifest.json`: width, height, SHA-256 and transparent-edge QA for each image.
- `activate.js` and `styles.css`: progressively enhance Home, Academy, Studio, Onboarding without rasterizing text, labels, data, XP values or click targets.
- `/ui-kit/raster/`: gallery showing every asset and filtering by category.
- `scripts/visual-qa.mjs`: visual Playwright coverage for desktop + mobile.
- `.github/workflows/raster-visual-qa.yml`: browser CI screenshots and artifact upload.

**Why not rasterize live progress bars or buttons?** Static baked-in bar percentages would misrepresent actual XP and would warp at responsive widths. Those functional primitives remain CSS/native DOM, while the kit provides their glyphs, decorative art, button styling and reference states.

All 275 images must be manually reviewed for art-direction issues; pixel-edge checks ensure no obvious cropped edges but cannot certify the absence of visually incorrect nearby motifs.
