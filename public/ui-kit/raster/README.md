# Verbarium: raster kit (235 independent assets)

Assets provided as a separate bundle: `public/ui-kit/raster/<category>/<name>.webp` and PNG fallback, plus `manifest.json`. This repository adds progressive integration code and the QA browser; it does **not** falsely ship the raster binaries. Import the 235 PNG + 235 WebP generated files before release.

Run locally after copying the package: `npm run test` and `npm run build`, then visit `/ui-kit/raster/` to inspect every crop.

The integration activates **only when manifest.json exists with 235 entries**, otherwise the prior SVG/CSS visual experience remains operational. The kit never flattens text, numbers, focus states, lesson progress, or buttons into images. Banner imagery is decorative only. 

Transparent halos and crop quality must be manually approved at device scales. The assets are derived from image generation; do not assume a pixel-perfect reconstruction of rounded corners, shadows, or overlapping sprite boundaries merely from zero-alpha edge checks.
