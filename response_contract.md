# Response Contract

## Turn Response Contract v1

After each user answer, the AI must return valid JSON only with the
following fields.

### Public (shown to the user during the interview)

**interviewer_message (string)**
A realistic interviewer response (professional, neutral-positive, no
scoring, no coaching lecture).

**next_question (string)**
The next main question or a reframed version of the current question if
the user is stuck.

**follow_ups (string[], 0--2 items)**
Optional. Include follow-ups only when: - the answer is too vague /
missing specifics (clarify) - the answer is strong (probe deeper / edge
cases) - the answer is partially off-track (bring them back)

------------------------------------------------------------------------

### Internal (used by the app; not shown mid-interview)

**internal_scores (object, each 1--5 integer)** - clarity - structure -
depth - relevance - confidence

**internal_flags (string[], 0--3 items)**
Allowed values: - off_topic - too_vague - rambling - stuck -
missing_role - no_example - contradiction

**internal_summary_of_answer (string, 1--2 sentences)**
A compact summary to preserve context and prevent repetition.

------------------------------------------------------------------------

### End-of-interview control

**end_interview (boolean)**
True only when the interview question set is complete.

**final_report (object or null)**
Must be null unless end_interview=true. When present, it contains:

-   overall_summary (string, 4--6 sentences)
-   scores (same 1--5 categories as internal_scores)
-   strengths (string[], 3--5 bullets)
-   improvements (string[], 3--5 bullets)
-   practice_plan (string[], 3--6 bullets)

------------------------------------------------------------------------

### Strict Output Rule

The AI must output valid JSON only.
No markdown. No extra text.
If unable to comply, output `{}`.
