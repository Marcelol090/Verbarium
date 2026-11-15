# Video QA (Android): 1000271788.mp4 · 20.94 s

## Verifiable problems from the supplied recording
1. The main home banner had white/pale-yellow copy on a light purple image. This causes unreadable heading, description and progress labels.
2. A compact, decorative banner raster was placed behind the full hero, at `background-size:contain`, producing repeated flashcards and bands. This asset is not a full-screen background.
3. Mascot, headline and CTA fought for space on the mobile hero.
4. Raster card/banner shadows were stretched with `object-fit:fill`, which distorts corner geometry.
5. The fixed bottom bar left insufficient scroll clearance.

## Changes
- Main hero uses a single nonrepeating, high-contrast pastel plane with native indigo text and progress.
- Mascot remains its own object with mobile position/size bounds, not part of the backdrop.
- Academy welcome card and Studio editor hero avoid patterned art underneath prose.
- Onboarding portraits have controlled center/focal point, no tiling.
- Raster card/banner art uses `object-fit:contain` while native CSS owns scalable borders and controls.
- Mobile safe-area bottom padding and reduced-motion behavior preserved.

The video also captures a temporary fade when changing pages. This alone is not evidence of a persistent blank screen. Verify final typography and illustrations with a live mobile browser after release.
