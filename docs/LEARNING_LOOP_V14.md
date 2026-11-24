# V14 — Learning loop
Original Verbarium Academy improvement. Reuses existing mascot and icon PNGs under public/verbarium-assets. No third-party Duolingo illustrations or new dependencies.
- Primary action: resume a valid session, review due concepts, continue an unlocked course unit, or practice if the course is complete.
- Review is a recommendation, never a new gate. Sentence production remains accessible directly.
- Same-day retries and premature practice no longer advance the retention stage; incorrect answers reset the schedule.
- Feedback explicitly announces error repair before the results; progress advances on submitted answers.
- Mobile focus card uses bounded image slots, 44px secondary targets, native controls and reduced-motion CSS.
References: https://blog.duolingo.com/new-duolingo-home-screen-design/ ; https://blog.duolingo.com/spaced-repetition-for-learning/ ; https://blog.duolingo.com/building-character/ ; https://blog.duolingo.com/time-spent-learning-well/
Validation: node --test tests/learning-loop-v14.test.mjs plus the existing suite. Browser/device visual QA and learning outcome experiments remain necessary.
