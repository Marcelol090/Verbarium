# Verbarium V15 — Living Learning Experience
## Research and decisions
- Duolingo core tabs redesign: https://blog.duolingo.com/core-tabs-redesign/ — tiered headings, deliberate whitespace, cross-device QA; don't add cards merely for visual consistency.
- Learning path: https://blog.duolingo.com/new-duolingo-home-screen-design/ — interleave new content, practice and stories; return-to-current control for long scroll.
- Character system: https://blog.duolingo.com/world-character-visemes/ — Rive state machine with independent body and mouth states, timestamped speech, interruptible playback. Our current raster assets cannot be treated as a rig. Existing director and TTS stay intact.
- Character design: https://blog.duolingo.com/building-character/ and https://design.duolingo.com/illustration/duo — character consistency and individualized reactions.
- Streak: https://blog.duolingo.com/streak-milestone-design-animation/ — earned celebration; no fake streaks.
- Teaching: https://blog.duolingo.com/duolingo-teaching-method/ and https://blog.duolingo.com/how-duolingo-experts-work-with-ai/ — curriculum, content, exercise creation, personalization.
- Personalization: https://blog.duolingo.com/learning-how-to-help-you-learn-introducing-birdbrain/ — local rule-based approximation first, not a Birdbrain clone or ML claim.
- Metrics: https://blog.duolingo.com/time-spent-learning-well/ — meaningful progress above XP farming.
- Independent comparator: https://eric.ed.gov/?id=EJ1473885 — both app groups improved, no significant difference in gains. Design success does not establish efficacy for Verbarium.
- Parallax: proposed Verbarium technique, not a verified claim that Duolingo implements a specific parallax algorithm.
## Implemented in this increment
Original V13 sky/hills isolated behind recommendation card; scroll-linked bounded 20px decoration with RAF/passive scroll, no hit-target transforms and reduced motion. Return to current lesson on long scroll. Original V4 weekly assets rendered from actual local XP activity. Per-question/feedback/finish transition keyed by real session event; no rerender replay. Pip support copy distinguishes error from success. Practice prioritizes due items, unseen items, then practiced items, excludes locked units. Existing voice and progress contracts preserved.
## Pedagogical blueprint (future expansion)
Define communicative objectives per CEFR-intended unit (not certification), prerequisites, concept IDs, original contexts, sample sentences, graded difficulty, accepted variants and feedback. For each target: meaning in context -> recognition -> discrimination -> guided word assembly -> cloze -> audio retrieval -> unaided written production -> transfer to unfamiliar sentence -> guided speaking -> delayed review. Adapt order without skipping prerequisites. Track initial vs aided vs retry vs delayed evidence separately. Start with subject + verb + object then be, questions/negation, present continuous, past, future, modal, present perfect, connectors. Build a curated bank of parallel exercises; use existing review history, not unsupported predictive AI.
## Component/motion architecture
Primitive: spacing 4/8/12/16/24/32, radius 12/16/20, 1px neutral border, 2px selection, min 44px hit target; confirm on real devices. Composites: topbar, bottom nav, unit header, path node, weekly strip, mission row, answer tile, word bank, progress bar, speaker control, feedback tray, reward, teacher editor. Assets separated by role: decorative background, foreground, mascot body, mouth rig, props, icon; no text baked in. State chart: idle -> listening -> thinking -> answer -> correct/retry -> continue; speech begin/viseme/end owns mouth layer independently; stop on route exit. 140ms tap, 200ms step, 240ms feedback, 480ms celebration as proposed tokens. Actual .riv rigs require source-separated character artwork, animator review and verified viseme files; do not ship fake lip-sync.
## Roadmap and gates
P0: Android D8 build and CI visual QA unblock; screenshot 320/360/390/430/desktop, no overlaps, safe areas, keyboard, reduced motion.
P1: inventory 54 kit archives into canonical manifests, hash dedupe, static/animated fallbacks, normalized anchors; review existing 928 design assets and 512 GIF library; no bulk runtime loading.
P2: path interleaving and competency graph, exercise pools, error categories, independently test mastery after 1/7/30 days; expand production across verbs and tenses.
P3: create actual Pip rig plus each of six characters, mouth chart, pose sheets, viseme/audio pipeline and interactive animation validation; migrate only after proof of runtime fidelity.
P4: shared Teacher Studio schema + student renderer, author previews, import compatibility, validated publishing/storage.
P5: measure first-attempt unaided transfer, delayed retention, completion, active learning minutes, abandonment and frame budget; run controlled experiments, report uncertainty.
