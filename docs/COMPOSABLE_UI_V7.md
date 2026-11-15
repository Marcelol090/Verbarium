# Verbarium Component Library v7 · first integrated wave

Source visual references: the six user-approved image design boards created for Verbarium on 2026-11-15. **A board is a visual specification, not an app asset**: its text and multiple cards cannot be published as one image without clipping, duplicate backgrounds and broken mobile typography.

## Implemented
- `public/ui-kit/components/library.js`: pure, separately reusable renderers for editable headers, pills, status/progress meters, CTAs, feature cards, lesson continuation hero, daily mission cards and Academy promotional cards.
- `public/ui-kit/components/library.css`: 100% responsive native components with scalable borders/shadows, color states, keyboard focus, reduced motion, and independent icon slots.
- `src/app.js`: homepage now uses the component library for the main header, lesson hero, daily missions, four feature cards, and Academy CTA in both Home and Learning.
- `public/components/`: read-only live specimen page for design review. Full interactivity belongs to the app itself.
- `public/studio/index.html`: direct link to component specimens.
- `tests/composable-ui.test.mjs`: real numeric state, dynamic content, escape safety, image existence, correct route/button semantics and independent DOM content.

## Asset map, source of truth
- Laboratory: `/verbarium-assets/icons/icon_layers_tile.png`
- Conversation: `/verbarium-assets/icons/icon_play_tile.png`
- Practice: `/verbarium-assets/icons/icon_clipboard_tile.png`
- Lessons: `/verbarium-assets/icons/icon_book_tile.png`
- Missions: `/verbarium-v3/assets/missions/target_dart.png`, `/verbarium-v3/assets/journey/book_standalone.png`, `/verbarium-v3/assets/speaking/mic_idle.png`
- Other glyphs: individual `/ui-kit/raster/icons/*.webp` and `/ui-kit/icons/*.svg`
- Mascot: the already published single `renderHeroMascot()` sprite, not an image embedded within the card.
- All original 235 raster assets remain available for other activities; this first wave uses the clean source icons rather than pre-rendered whole-card bitmaps.

## Layout rules
- Each action is a semantic button or link and retains the app's existing data route/action protocol.
- No rasterized labels, card borders, paragraphs, prices, or progress percentages.
- Backgrounds behind text are gradients, not stretched/tiled artwork.
- The hero uses true grid slots for mascot, lesson copy, meter and CTA, eliminating text–mascot overlap on Android.
- The existing `.vb5-mission[data-vb5-mission]` and `.vb5-mission-bar i` hooks remain for motion and real progress.
- Under 365 px, four feature cards become one-column. No overlap of card labels or touch targets.

## Following waves
- Individual listening, matching, drag/drop and dialogue answer components with feedback states, masks and visemes.
- Academy path nodes, achievement/reward and journey scene primitive catalogues.
- Studio authoring palette bindings using the same components and typed content schemas.

Do not claim that generating this HTML/CSS changes the underlying pedagogy, neural speech voice credentials or the whole app's other screens. Run CI and mobile visual QA before release.
