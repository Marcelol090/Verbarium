# Verbarium · Precision V8 design contract

Scope: mobile Home, Academy, lesson and onboarding. Preserve existing teaching flow, persisted progress, speech, XP, scoring and navigation. All 48 packaged PNG/WebP pieces remain published at `/verbarium-visual-kit/assets/`.

## Tokens and responsibility

| Role | Rule | Reason |
|---|---|---|
| Layout rhythm | 4 px base, use 8 / 12 / 16 / 20 / 24 / 32 | Consistent perceptual spacing |
| Surface edge | 1 px solid `#DED7EB` | Define actual component boundaries |
| Selected choice | 2 px border | Stronger state without optical drift; all choices start with 2 px |
| Keyboard focus | 3 px outside outline with 3 px offset | Keyboard focus distinct from selection |
| Icons | 24×24 viewBox, 2 px round stroke | Consistent optical weight in navigation and actions |
| Tap target | at least 48 px; primary CTA 56 px | Android/mobile accessibility |
| Small controls | 12 px radius | Paired with 48–56 px controls |
| Cards | 24 px radius | Reusable contained group |
| Heroes | 28 px radius | Editorial hierarchy |
| Cream canvas | `#F8F6FB` | Quiet visual base |
| Ink | `#362A50` | High-contrast content |
| Violet CTA | `#6946C6` (white text) | Calculated contrast ~6.4:1 |
| Orange ornament | `#EF8B53`; body text uses `#B45324` | Avoid inaccessible white-on-orange text |
| Subtle elevation | 1px/2px + 7px/18px neutral shadow | Separate UI planes without artificial gloss |
| Motion | 160 ms, with reduced-motion support | Functional feedback, not animation for decoration |

### Image semantics

- **Mascots** `fox_*`: art-only, image on dedicated grid track with `object-fit:contain`, never negative absolute offset.
- **Rewards** `reward_*`: small illustrations in missions, skill cards and weekly achievements.
- **Backgrounds** `background_*`: panel-scoped decorations at their intrinsic aspect ratio, with safe gradient fill behind.
- **Cards, grids, labels and button concept art**: available as 48 independent images in the design studio. They are *not* stretched as background textures behind dynamic text. The real components are HTML/CSS, which enables long lesson labels, state updates, translation and text scaling.
- **Choice states**: selected violet, correct green, wrong coral, all with coherent border widths; grading semantics remain in the Academy model.
- **Navigation**: 24px symbols within >=48px hit targets, with visible active backgrounds and explicit focus rings.

## Media breakpoints and QA

- 320px: title wraps, art stays in own track, no horizontal overflow.
- 360px and 390px: responsive card grid and text area, unclipped mascot.
- 430px: consistent margins and optically aligned cards.
- >770px: V8 mobile enhancements do not overwrite desktop legacy UI.
- Browser QA checks rendered asset natural dimensions, CTA radius, color, border, image bounds, interactive heights, Academy header clipping and overall horizontal overflow. V8 studio checks 48 live WebP images.

## Integration

Files:
- `public/ui-kit/precision-v8.css`: tokens and mobile component rules.
- `public/ui-kit/precision-v8.js`: resilient art-only progressive hydration; cached asset loading, graceful fallbacks.
- `public/ui-kit/precision-v8/index.html`: accessible visual inspector.
- `tests/precision-v8.test.mjs`: automatic contract.
- `scripts/mobile-visual-qa.mjs`: Playwright viewport checks and screenshot artifacts.

The V8 CSS link is moved to the end of `<head>` after V7's legacy relocation to prevent specificity/order regressions.

## Remaining manual production verification

On-device Android/iOS font rendering; screen-reader navigation with TalkBack/VoiceOver; localized long strings; real device color calibration; OS reduced-motion transitions; performance profiling on low-powered phones.
