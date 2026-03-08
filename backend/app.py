# backend/app.py

import json
import random
import re
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from services.prompt_loader import PromptLoader
from services.nova_client import NovaClient
from services.session_store import SessionStore

app = FastAPI()
load_dotenv()

prompts = PromptLoader()
nova = NovaClient()
store = SessionStore()

COMPANY_NAMES = [
    "Helix Technologies",
    "Ardent Systems",
    "Crestline Software",
    "Vantara Engineering",
    "Stratum Labs",
    "Nexbridge Solutions",
    "Ironclad Digital",
    "Parallax Tech",
    "Nimbus Works",
    "Solaris Engineering",
]

INTERVIEWER_NAMES = [
    "Alex Chen",
    "Jordan Rivera",
    "Morgan Patel",
    "Taylor Kim",
    "Casey Okafor",
    "Riley Nakamura",
    "Drew Vasquez",
    "Quinn Adeyemi",
    "Avery Larsson",
    "Blake Thornton",
]


VALID_DIFFICULTIES = {"intern", "junior", "senior"}


def build_system_prompt_for_session(session_id: str) -> str:
    sess = store.get(session_id)
    company = sess.get("company_name", "Helix Technologies")
    interviewer = sess.get("interviewer_name", "Alex Chen")
    difficulty = sess.get("difficulty", "junior")
    return (
        prompts.build_system_prompt()
        .replace("{{COMPANY_NAME}}", company)
        .replace("{{INTERVIEWER_NAME}}", interviewer)
        .replace("{{DIFFICULTY}}", difficulty.capitalize())
    )


def parse_model_json(reply_text: str) -> dict:
    cleaned = reply_text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1].strip()
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()

    return json.loads(cleaned)


# ---------------------------------------------------------------------------
# Conduct detection
# ---------------------------------------------------------------------------

_PROFANITY_RE = re.compile(
    r"\b(fuck|shit|bitch|bastard|cunt|ass\s*hole|dickhead|prick|twat|wanker)\b",
    re.IGNORECASE,
)

_DISMISSIVE_PHRASES = {
    "idk", "i don't know", "i dont know", "skip", "pass", "whatever",
    "who cares", "i don't care", "i dont care", "boring", "nope", "nah",
    "idc", "lol", "lmao", "haha", "n/a", "nothing", "none", "no idea",
    "not interested", "can't be bothered", "couldn't care less",
}

_HOSTILE_RE = re.compile(
    r"\b(stupid|idiot|dumb|moron|i hate (you|this)|shut up|you suck|this sucks|go away)\b",
    re.IGNORECASE,
)


def classify_input(user_text: str, history: list) -> str:
    """
    Returns a behavior classification:
      'profanity' | 'hostile' | 'echo' | 'gibberish' | 'dismissive' | 'normal'
    Priority order: profanity > hostile > echo > gibberish > dismissive > normal
    """
    text = user_text.strip()

    if _PROFANITY_RE.search(text):
        return "profanity"

    if _HOSTILE_RE.search(text):
        return "hostile"

    # Echo: near-exact copy of the last assistant message
    for msg in reversed(history):
        if msg["role"] == "assistant":
            # History may store raw JSON or plain text
            try:
                parsed = json.loads(msg["text"])
                last = parsed.get("interviewer_message", "").strip()
            except (json.JSONDecodeError, AttributeError):
                last = msg["text"].strip()
            if last and (text == last or (len(text) > 20 and text in last)):
                return "echo"
            break

    # Gibberish: long-ish input with almost no real words
    alpha_words = re.findall(r"[a-zA-Z]{2,}", text)
    if len(text) > 6 and sum(len(w) for w in alpha_words) / max(len(text), 1) < 0.35:
        return "gibberish"

    # Dismissive: short phrase that signals refusal to engage
    if text.lower() in _DISMISSIVE_PHRASES:
        return "dismissive"

    return "normal"


# ---------------------------------------------------------------------------
# Pre-written conduct responses (model is bypassed for all of these)
# ---------------------------------------------------------------------------

CONDUCT_RESPONSES = {
    "echo": [
        [  # tier 1
            "I see what happened there. Let me rephrase — what's your general approach to this kind of problem?",
            "Interesting move. Want to take a real swing at it? Just tell me the first idea that comes to mind.",
            "Nice try. How about your own take this time?",
        ],
        [  # tier 2
            "I'm going to need an actual answer here. Take a moment and walk me through your thinking.",
            "Let's be straightforward — I need your genuine response to move forward.",
            "This is the second time. I need you to engage with the question for real.",
        ],
        [  # tier 3+
            "Noted. Let's move on to something else.",
            "Alright — let's try a completely different angle.",
            "Got it. Moving forward.",
        ],
    ],
    "profanity": [
        [  # tier 1
            "Let's keep the language professional. I'll need you to watch that going forward.",
            "That kind of language isn't appropriate here. Let's refocus.",
        ],
        [  # tier 2
            "That's the second time — I need this to stay professional or we'll have to wrap up early.",
            "I've noted the language again. One more and I'll have to end the session.",
        ],
        [  # tier 3+ — session ends
            "I'm going to end the session here. Unprofessional language is not acceptable in an interview setting.",
        ],
    ],
    "hostile": [
        [  # tier 1
            "Let's keep things constructive. I'm here to help you practice.",
            "I understand frustration, but let's stay focused and professional.",
        ],
        [  # tier 2
            "That kind of tone isn't going to work here. I need us to stay professional.",
            "This is becoming unproductive. If this continues I'll have to end the session.",
        ],
        [  # tier 3+ — session ends
            "I'm going to end the session. This isn't a productive environment to continue the interview.",
        ],
    ],
    "gibberish": [
        [  # tier 1
            "Didn't quite catch that — want to give it another go?",
            "Hmm, that one didn't come through clearly. Take your time and try again.",
        ],
        [  # tier 2
            "Still not getting a clear response. Are you having trouble with the question?",
            "Let's slow down. Can you give me a coherent answer to move forward?",
        ],
        [  # tier 3+
            "I'm going to move on — let me ask you something different.",
            "Noted. Let's try a fresh question.",
        ],
    ],
    "dismissive": [
        [  # tier 1
            "Let's slow down. What's your initial instinct, even if it's rough?",
            "That's okay — just tell me the first approach that comes to mind.",
            "No pressure. Even a starting point is helpful.",
        ],
        [  # tier 2
            "I need something to work with here. Take a moment and give me your honest best attempt.",
            "We can't move forward without some engagement. What do you think?",
        ],
        [  # tier 3+
            "Alright, let's move on to a different question.",
            "Got it — let's try something else.",
        ],
    ],
}

# Behavior types that terminate the session at tier 3
_TERMINATING_TYPES = {"profanity", "hostile"}


def make_conduct_reply(behavior_type: str, tier: int) -> tuple[dict, bool]:
    """
    Returns (reply_dict, end_session).
    Bypasses the model entirely.
    """
    responses = CONDUCT_RESPONSES.get(behavior_type, CONDUCT_RESPONSES["dismissive"])
    # Clamp to last tier bucket
    bucket = responses[min(tier - 1, len(responses) - 1)]
    msg = random.choice(bucket)

    end_session = tier >= 3 and behavior_type in _TERMINATING_TYPES

    flag_map = {
        "echo": ["mocking", "echoing_response"],
        "profanity": ["profanity"],
        "hostile": ["hostile_behavior"],
        "gibberish": ["incoherent_response"],
        "dismissive": ["too_vague"],
    }

    return {
        "interviewer_message": msg,
        "next_question": "",
        "follow_ups": [],
        "internal_scores": {"clarity": 1, "structure": 1, "depth": 1, "relevance": 1, "confidence": 1},
        "internal_flags": flag_map.get(behavior_type, ["unusual_behavior"]),
        "internal_summary_of_answer": f"Candidate exhibited {behavior_type} behavior (tier {tier}).",
        "end_interview": end_session,
        "conduct_terminated": end_session,
        "final_report": None,
    }, end_session


def _sanitize_assistant_history(raw_text: str) -> str:
    """
    Strip internal scoring / flag fields from stored assistant JSON so the
    model only sees interviewer_message and next_question in its own prior
    turns. This prevents it from latching onto old conduct flags.
    """
    try:
        data = json.loads(raw_text)
        clean = {
            "interviewer_message": data.get("interviewer_message", ""),
            "next_question": data.get("next_question", ""),
            "follow_ups": data.get("follow_ups", []),
            "candidate_tone": data.get("candidate_tone", "professional"),
        }
        return json.dumps(clean)
    except (json.JSONDecodeError, AttributeError):
        return raw_text


def build_messages_for_turn(history: list, new_user_text: str, soft_conduct_count: int = 0) -> list:
    """
    Builds a proper multi-turn messages list for the Bedrock Converse API.
    Each prior exchange becomes a real user/assistant message pair so the
    model has native awareness of what it has already said.
    """
    messages = []

    # Replay prior turns as proper user/assistant pairs (last 12 messages)
    for msg in history[-12:]:
        role = msg["role"]  # "user" or "assistant"
        text = msg["text"]
        if role == "assistant":
            text = _sanitize_assistant_history(text)
        messages.append({"role": role, "content": [{"text": text}]})

    # Build the new user message with optional conduct note
    parts = []
    if soft_conduct_count == 1:
        parts.append(
            "[CONDUCT NOTE: The candidate has shown some disengaged or unprofessional "
            "tone recently. Be a bit more direct and businesslike than usual, but do not "
            "lecture or scold. If their current answer is genuinely on-topic, ease up "
            "and continue normally.]"
        )
    elif soft_conduct_count == 2:
        parts.append(
            "[CONDUCT NOTE: The candidate has now shown disengaged or unprofessional tone "
            "multiple times. Be direct and serious. Tell them plainly that their engagement "
            "needs to improve for this session to be productive. Then ask the question once more. "
            "If they are currently improving, acknowledge that implicitly by being less stern.]"
        )
    elif soft_conduct_count >= 3:
        parts.append(
            "[CONDUCT NOTE: This is a repeated pattern of poor tone. Respond very "
            "briefly and professionally, note that you are observing a pattern, and move "
            "to a new question. Keep your response short and unemotional.]"
        )
    parts.append(new_user_text)
    parts.append("Remember: you must respond with valid JSON only, using the schema from your system prompt.")

    messages.append({"role": "user", "content": [{"text": "\n\n".join(parts)}]})
    return messages


class StartRequest(BaseModel):
    role: str
    difficulty: str = "junior"


class TurnRequest(BaseModel):
    session_id: str
    text: str


class EndRequest(BaseModel):
    session_id: str


@app.get("/")
def home():
    return {"message": "AI Interviewer backend running"}


@app.post("/start")
def start(req: StartRequest):
    difficulty = req.difficulty.lower()
    if difficulty not in VALID_DIFFICULTIES:
        raise HTTPException(status_code=422, detail=f"Invalid difficulty. Must be one of: {', '.join(sorted(VALID_DIFFICULTIES))}")

    session_id = store.create_session()
    store.get(session_id)["company_name"] = random.choice(COMPANY_NAMES)
    store.get(session_id)["interviewer_name"] = random.choice(INTERVIEWER_NAMES)
    store.get(session_id)["difficulty"] = difficulty

    system_text = build_system_prompt_for_session(session_id)
    user_text = f"Start the interview for a {req.role} at the {difficulty} level. Ask your warm-up question."

    reply_text = nova.converse(system_text=system_text, user_text=user_text)

    try:
        reply = parse_model_json(reply_text)
    except Exception:
        raise HTTPException(status_code=500, detail=f"Model did not return valid JSON. Raw: {reply_text}")

    # Save what happened
    store.append(session_id, "user", user_text)
    store.append(session_id, "assistant", reply_text)

    return {"session_id": session_id, "ai": reply}


@app.post("/turn")
def turn(req: TurnRequest):
    sess = store.get(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Unknown session_id")
    if sess.get("ended"):
        raise HTTPException(status_code=400, detail="Session already ended")

    # Classify input and track per-type conduct counts
    behavior = classify_input(req.text, sess["history"])

    if behavior != "normal":
        counts = sess.setdefault("conduct_counts", {})
        counts[behavior] = counts.get(behavior, 0) + 1
        tier = counts[behavior]

        reply, end_session = make_conduct_reply(behavior, tier)
        store.append(req.session_id, "user", req.text)
        store.append(req.session_id, "assistant", json.dumps(reply))
        if end_session:
            store.end(req.session_id)
        return reply

    system_text = build_system_prompt_for_session(req.session_id)

    # Build the next input using history, passing current soft conduct count
    soft_count = sess.get("soft_conduct_count", 0)
    messages = build_messages_for_turn(sess["history"], req.text, soft_count)

    reply_text = nova.converse(system_text=system_text, messages=messages)

    try:
        reply = parse_model_json(reply_text)
    except Exception:
        raise HTTPException(status_code=500, detail=f"Model did not return valid JSON. Raw: {reply_text}")

    # Track soft conduct from the model's own tone assessment
    tone = reply.get("candidate_tone", "professional")
    if tone in ("unprofessional", "disengaged"):
        sess["soft_conduct_count"] = sess.get("soft_conduct_count", 0) + 1
    else:
        # Gradual decay — a real interviewer remembers but eases up
        sess["soft_conduct_count"] = sess.get("soft_conduct_count", 0) // 2

    # Save the turn
    store.append(req.session_id, "user", req.text)
    store.append(req.session_id, "assistant", reply_text)

    # If model says end_interview, mark ended
    if reply.get("end_interview") is True:
        store.end(req.session_id)

    return reply


@app.post("/end")
def end(req: EndRequest):
    sess = store.get(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Unknown session_id")

    # Count actual user responses (the first "user" message is the system-generated
    # start prompt, not a real candidate answer)
    user_turns = [m for m in sess["history"] if m["role"] == "user"]
    real_responses = len(user_turns) - 1  # subtract the initial start prompt

    if real_responses <= 0:
        store.end(req.session_id)
        return {
            "end_interview": True,
            "interviewer_message": "",
            "next_question": "",
            "no_responses": True,
            "final_report": {
                "overall_summary": "The interview ended before any responses were provided. No evaluation is available.",
                "scores": {"clarity": 0, "structure": 0, "depth": 0, "relevance": 0, "confidence": 0},
                "strengths": [],
                "improvements": [],
                "practice_plan": ["Complete at least one full interview session to receive actionable feedback."]
            }
        }

    system_text = build_system_prompt_for_session(req.session_id)

    # Determine if the session had minimal effort (short/trivial answers)
    user_messages = [m["text"] for m in sess["history"] if m["role"] == "user"][1:]  # skip start prompt
    avg_len = sum(len(m.strip()) for m in user_messages) / max(len(user_messages), 1)
    is_minimal = real_responses <= 2 and avg_len < 30

    end_instruction = "The interview is now complete. Generate the final_report object and set end_interview=true."
    if is_minimal:
        end_instruction += (
            " IMPORTANT: The candidate provided very few and/or extremely short responses "
            "that did not demonstrate technical knowledge. Scores MUST reflect the actual "
            "content provided — do NOT infer ability or give credit for what was not said. "
            "If the candidate only gave greetings, single words, or trivially short non-answers, "
            "all scores should be 1. Strengths should be empty or minimal. "
            "Be honest and direct in the summary about the lack of substantive responses."
        )

    # Ask model to generate final report based on the conversation
    messages = build_messages_for_turn(
        sess["history"],
        end_instruction
    )

    reply_text = nova.converse(system_text=system_text, messages=messages)

    try:
        reply = parse_model_json(reply_text)
    except Exception:
        raise HTTPException(status_code=500, detail=f"Model did not return valid JSON. Raw: {reply_text}")

    store.end(req.session_id)
    return reply