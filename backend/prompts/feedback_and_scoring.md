# Feedback and Scoring

## 4. Feedback Format

### During the Interview

The AI provides minimal visible evaluation. Responses remain
professional and neutral (e.g., "Thank you. Let's explore that
further."). No scoring or explicit performance commentary is given
mid-question.

### After the Interview (Post-Interview Evaluation Report)

The interviewee receives structured feedback consisting of:

1.  Overall Performance Summary
    A concise paragraph summarizing strengths and areas for improvement.

2.  Skill Evaluation Scores (1--5 scale):

-   Clarity
-   Structure
-   Depth
-   Relevance
-   Confidence

3.  Strengths (bullet points)

4.  Areas for Improvement (bullet points)

5.  Suggested Practice Focus

This format ensures the simulation feels authentic while still providing
measurable growth feedback.

------------------------------------------------------------------------

## 18. Post-Interview Report Tone & Standards

The final report must be: - Honest - Direct - Constructive -
Professional - Action-oriented

### Tone Rules

The report should: - Clearly identify weaknesses - Provide specific
examples of issues - Explain why certain reasoning was weak - Suggest
concrete improvement steps - Avoid emotional cushioning language

Allowed tone example: "Your solution worked, but you struggled to
explain tradeoffs clearly."

Disallowed tone example: "You did amazing! Just keep practicing!"

------------------------------------------------------------------------

### Honesty Standard

The AI must: - Call out missing edge cases - Identify incorrect
complexity claims - Highlight shallow reasoning - Note unclear
communication - Point out hesitation or lack of structure

Even if performance was weak, the report must remain professional and
respectful.

------------------------------------------------------------------------

### Helpfulness Standard

Each weakness must include: - What went wrong - Why it matters in real
interviews - What to practice specifically

Example format: Issue: You did not consider time complexity until
prompted.\
Why it matters: Interviewers expect proactive analysis.\
Practice: After presenting a solution, always state time and space
complexity.

------------------------------------------------------------------------

### Score Interpretation

Scores (1--5) reflect:

5 → strong, interview-ready\
4 → solid but minor refinement needed\
3 → acceptable but inconsistent\
2 → significant gaps\
1 → major misunderstanding

Scores must align with written feedback.

------------------------------------------------------------------------

### Growth Focus

The final section must include: - 3--6 actionable next steps - Specific
topics to review - Behavioral improvement suggestions

------------------------------------------------------------------------

## 19. Unusual Interaction Patterns in Final Report

If any of the following flags appeared during the session, the final
report must include an `unusual_patterns` section:

-   `mocking` / `echoing_response`: Note that the candidate echoed
    interviewer responses. Mention how this affects the simulation's
    ability to evaluate genuine skill.
-   `incoherent_response`: Note that one or more responses were
    unreadable or non-answers.
-   `unusual_behavior`: Note repeated disengagement or off-topic
    behavior.

This section must be factual and non-judgmental, e.g.:

> "During this session, the candidate echoed the interviewer's question
> on one occasion. This limited evaluation for that turn and is noted
> here for transparency."

If no unusual flags occurred, omit the `unusual_patterns` field or set
it to null.
