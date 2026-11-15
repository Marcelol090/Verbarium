# Verbarium: Evidence-first learning graph v1

**Original implementation**, informed by the *general principles* described publicly at https://www.openlangkit.space/ and https://github.com/ywEdAi/OpenLanguageKit. We neither copy its source code, curriculum files, exercise data, pedagogy contracts nor illustrations.

## What ships
- `/learning/`: eight original English grammar micro-competencies with explicit required and optional helpful prerequisites.
- Three exercises per competency: recognition, production and contextual transfer, all with authored prompts and expected answers.
- Pure dependency-free engine: graph validation, topological order, item grading, safe local persistence and evidence classification.
- Evidence is separated into first independent success, correct answers with hints, corrections after errors, and independent transfer. Correct after a hint **does not** count as independent success.
- Unlocked competencies are based on independent production **and** contextual transfer. Results are not CEFR proficiency certification.
- Academy entry point to practice, using existing Verbarium UI tokens and separate images.

## Learning limitations
- The eight competencies and 24 activities are a pilot, not the source site's 950-point curriculum, nor all 56 teaching designs.
- The exercises use written answers and do **not** score pronunciation or oral proficiency.
- No remote analytics or cloud profile in this pilot; the event ledger is browser-local.
- Progress evidence means only that the learner answered the authored tasks, not demonstrated general language proficiency.
- No source data from OpenLanguageKit was imported. Their repository is CC BY-NC 4.0, so direct incorporation into any subscription or other commercial application would require a separate commercial licence from its author; consult https://github.com/ywEdAi/OpenLanguageKit/blob/main/COMMERCIAL.md.

## Future increments
- Connect `Studio` template activity IDs to independently authored knowledge IDs and evidence rules.
- Add diagnostic placement, delayed recall, novel unseen transfer examples and independent human review of CEFR alignment.
- Support prompts and explanations based on a validated curriculum graph, avoiding unsupported mastery claims.
