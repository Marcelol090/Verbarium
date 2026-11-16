# Verbarium UI Kit · Onboarding 2026

This first implementation recreates the supplied visual kit as **separate, text-free SVG art assets** plus accessible, CSS-driven UI primitives. The original generated PNG sheets are design references, not embedded screens.

- `backgrounds/*.svg`: individual onboarding, lesson, celebration, premium, neutral illustration backgrounds.
- `icons/*.svg`: individually addressable mono glyphs without baked-in text or container.
- `kit.css`: composable card, button, segmented selector, progress, carousel and selection styles, plus scoped Academy and Teacher Studio adapters.
- `/onboarding/`: optional 6-step, **first-lesson-before-account** journey with goal, level, time and sentence-building practice.
- `/academy/`: picks up the chosen goal after finishing the first lesson, as a visible contextual bridge.
- `/`: offers a link into onboarding; existing routes and lesson engines stay intact.

No real product price, trial period, refund claim, review, or subscription has been invented; no payment or authentication is implied. Browser speech synthesis is used for the guest micro-lesson. Production neural voice remains tied to the existing Azure approved-clip pipeline in Academy / Studio.

Use CSS progress fills with native text in the DOM. Images must not contain headings, subtitles, or instructional text. Override kit tokens rather than rasterizing UI copy into art.


## Art Direction V9

The app now shares one section-specific background set in `backgrounds/`: `home.svg`, `academy.svg`, `lesson.svg`, `practice.svg`, `conversation.svg`, `profile.svg`, `onboarding.svg`, `celebration.svg`, `premium.svg` and `neutral.svg`.

These SVGs are original, scalable scenery layers with no baked-in copy. The fox remains a separate transparent illustration. Core glyphs are 24 × 24 SVGs with rounded 2.2 px strokes. Buttons, progress, labels, choices and cards stay native HTML/CSS so their labels, state, accessibility and actions can change independently.

The home flow prioritizes resume lesson → real progress → learning path → daily missions → focused practice modes → weekly streak → Academy. Repeated promo tiles and duplicate quick-action rows were removed from the home route; their underlying destinations remain reachable.


The V8 asset hydrator now preserves V9 native SVG glyphs and only decorates dedicated mascot slots. It also re-applies the V9 stylesheet after its legacy V8 style-order adjustment so the shared component system remains authoritative.
