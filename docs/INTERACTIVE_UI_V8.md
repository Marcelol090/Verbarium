# Verbarium Interactive Components v8

**Status:** integrated, pending CI/visual review at PR creation. Implements internal screen layout using independent text, images, controls, state and CSS. It **does not** copy a Duolingo screen or insert flattened design sheets as assets.

## Modules
- `public/ui-kit/components/lesson-ui.js`: standalone pure renderers:
  - `renderStepMeter`: fraction-derived progress and ARIA state.
  - `renderChoiceGroup`: native-choice buttons with idle, selected, correct, incorrect, disabled states.
  - `renderFeedback`: success/correction and explanatory subtitle.
  - `renderLessonQuestion` and `renderLessonCompletion`: original grammar lesson lifecycle.
  - `renderPracticeScreen`: recognition, writing and review completion lifecycle.
  - `renderDialogueMessages`, `renderDialogueScreen`: auditory turns, selected scenario, microphone control and dialogue transitions.
  - `renderGuidedPath`: cards from actual lessons and completion state, no artificial locks.
  - `renderRewards`: actual completed lessons, attempts, accuracy, streak and review due count, with no fake rankings/XP.
- `public/ui-kit/components/lesson-ui.css`: reusable rounded lavender styling; editable copy is not rasterized, and no entire screenshot is a background.
- `public/ui-kit/components/academy-v8.css`: scoped Academy style adaptation of options, feedback, path and completion. Existing Academy course engine, visemes, neural audio and scores remain untouched.
- `src/app.js`: existing event protocol and persistence retained, main internal routes now render via reusable components.
- `public/components/`: design specimens also show answered lesson, writing, dialogue, guided path and real-data reward cards.
- `tests/learning-ui-v8.test.mjs`: checks icon files, action hooks, states, accessibility, escaping, dynamic progress, and integration.

## Interaction invariants
- Original handlers continue: `lesson-answer`, `lesson-next`, `practice-mode`, `practice-answer`, `practice-submit`, `practice-next`, `dialog-choice`, `dialog-next`, `select-scenario`, `speak-audio`, `record-speech`, `reset-scenario`, `open-lesson`.
- Writing input ID `write-answer` remains stable for keyboard Enter and existing evaluation code.
- No new speech quality claims. Browser transcription remains approximate and optional.
- All progress values use app data. Academy scoring/pedagogy remains independently implemented.
- The path defaults to seven lessons around the current one; original world/skill maps remain available inside a disclosure in the Learn route.
- Motion uses CSS transforms/opacity on newly revealed feedback and bubbles, honors `prefers-reduced-motion`.

## QA limitations
Automated CI verifies functions, contracts, files and build, **not** pixel-level correctness on all real devices. Final Android viewport inspection and screen-reader QA remain necessary. Do not claim image-gen reference boards themselves are separate usable binary assets; this implementation uses clean published icons with CSS-built surfaces.
