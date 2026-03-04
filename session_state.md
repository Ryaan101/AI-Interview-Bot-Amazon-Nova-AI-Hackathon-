# Session State Model (v1)

This document defines the data stored by the backend during an interview
session.
It acts as the single source of truth for server logic, AI memory, and
interview progression.

The state model is intentionally simple for v1 (2-question sessions)
while supporting realistic conversation continuity.

------------------------------------------------------------------------

## 1. Session Object

Represents one complete interview.

  ------------------------------------------------------------------------
  Field                          Type                 Description
  ------------------------------ -------------------- --------------------
  session_id                     string               Unique identifier
                                                      for the interview
                                                      session

  candidate_name                 string               Name provided during
                                                      account setup, used
                                                      for greeting

  difficulty                     string               Current difficulty
                                                      level (v1: "intern")

  question_limit                 number               Total primary
                                                      questions allowed
                                                      (v1: 2)

  question_index                 number               Current question
                                                      number (starts at 1)

  current_question               string               The active main
                                                      question being
                                                      discussed

  conversation_summary           string               Rolling memory
                                                      summary used instead
                                                      of full transcript

  turns                          Turn[]               List of all
                                                      interaction turns

  scores_history                 Score[]              Scores from each AI
                                                      evaluation turn

  flag_history                   string[]             Aggregated internal
                                                      flags across session

  is_finished                    boolean              Indicates interview
                                                      has ended
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## 2. Turn Object

Represents one candidate answer and one AI response.

  ------------------------------------------------------------------------
  Field                          Type                 Description
  ------------------------------ -------------------- --------------------
  turn_number                    number               Incrementing
                                                      interaction count

  user_text                      string               Candidate response
                                                      (typed or voice
                                                      transcript)

  ai_json                        object               Full structured AI
                                                      response following
                                                      the response
                                                      contract

  timestamp                      number (optional)    Time of interaction
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## 3. Score Object

Stored after each AI evaluation.

  Field        Type
  ------------ ---------------
  clarity      number (1--5)
  structure    number (1--5)
  depth        number (1--5)
  relevance    number (1--5)
  confidence   number (1--5)

------------------------------------------------------------------------

## 4. Lifecycle of a Session

### Start Session

1.  Create session object
2.  Set question_index = 1
3.  Generate first question
4.  Initialize empty summary

### Each Turn

1.  User submits answer
2.  Server sends:
    -   current_question
    -   conversation_summary
    -   difficulty to the AI
3.  AI returns structured JSON
4.  Server:
    -   stores turn
    -   appends score to scores_history
    -   appends flags to flag_history
    -   updates conversation_summary
    -   updates current_question if needed
    -   increments question_index if new question

### End Session

When: question_index > question_limit OR end_interview == true

Server sets: is_finished = true

Then displays the final report.

------------------------------------------------------------------------

## 5. Memory Strategy (Rolling Summary)

The system does NOT send the full transcript to the AI each turn.

Instead it sends conversation_summary.

### Why

-   Lower token usage
-   Faster responses
-   More stable behavior
-   Prevents prompt overflow

### How It Updates

After each turn, append a compact memory line using the AI's internal
summary:

Example: Q1: Candidate proposed hash map solution; initially missed edge
cases but corrected after prompting.

The summary should stay under ~6 sentences total.

Older information should be compressed when necessary.

------------------------------------------------------------------------

## 6. End Condition Rules

The interview ends when:

1.  The maximum number of questions is reached
2.  The AI explicitly sets end_interview = true

After ending: - No additional turns are accepted - Only the final report
is shown - The session becomes read-only

------------------------------------------------------------------------

## Design Philosophy

The state model prioritizes: - predictable behavior - reproducibility -
low token usage - realistic continuity

The AI simulates intelligence, but the server owns the truth.
