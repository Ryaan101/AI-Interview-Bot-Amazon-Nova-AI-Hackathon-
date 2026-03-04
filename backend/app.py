# backend/app.py

import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from services.prompt_loader import PromptLoader
from services.nova_client import NovaClient
from services.session_store import SessionStore

app = FastAPI()

prompts = PromptLoader()
nova = NovaClient()
store = SessionStore()


def parse_model_json(reply_text: str) -> dict:
    cleaned = reply_text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1].strip()
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()

    return json.loads(cleaned)


def build_user_text_for_turn(history: list, new_user_text: str) -> str:
    """
    Converts session history into a single user message.
    Keeps it simple and robust for hackathon.
    """
    lines = []
    lines.append("You are continuing an ongoing interview.")
    lines.append("Conversation so far:")
    for msg in history[-12:]:  # keep last N to avoid huge prompts
        prefix = "Candidate" if msg["role"] == "user" else "Interviewer"
        lines.append(f"{prefix}: {msg['text']}")
    lines.append("")
    lines.append(f"Candidate: {new_user_text}")
    lines.append("")
    lines.append("Respond with the required JSON schema.")
    return "\n".join(lines)


class StartRequest(BaseModel):
    role: str 


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
    session_id = store.create_session()

    system_text = prompts.build_system_prompt()
    user_text = f"Start the interview for a {req.role}. Ask your warm-up question."

    reply_text = nova.converse(system_text=system_text, user_text=user_text)

    try:
        reply = parse_model_json(reply_text)
    except Exception:
        raise HTTPException(status_code=500, detail=f"Model did not return valid JSON. Raw: {reply_text}")

    # Save what happened
    store.append(session_id, "user", user_text)
    store.append(session_id, "assistant", reply.get("interviewer_message", ""))

    return {"session_id": session_id, "ai": reply}


@app.post("/turn")
def turn(req: TurnRequest):
    sess = store.get(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Unknown session_id")
    if sess.get("ended"):
        raise HTTPException(status_code=400, detail="Session already ended")

    system_text = prompts.build_system_prompt()

    # Build the next input using history
    user_text = build_user_text_for_turn(sess["history"], req.text)

    reply_text = nova.converse(system_text=system_text, user_text=user_text)

    try:
        reply = parse_model_json(reply_text)
    except Exception:
        raise HTTPException(status_code=500, detail=f"Model did not return valid JSON. Raw: {reply_text}")

    # Save the turn
    store.append(req.session_id, "user", req.text)
    store.append(req.session_id, "assistant", reply.get("interviewer_message", ""))

    # If model says end_interview, mark ended
    if reply.get("end_interview") is True:
        store.end(req.session_id)

    return reply


@app.post("/end")
def end(req: EndRequest):
    sess = store.get(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Unknown session_id")

    system_text = prompts.build_system_prompt()

    # Ask model to generate final report based on the conversation
    user_text = build_user_text_for_turn(
        sess["history"],
        "The interview is now complete. Generate the final_report object and set end_interview=true."
    )

    reply_text = nova.converse(system_text=system_text, user_text=user_text)

    try:
        reply = parse_model_json(reply_text)
    except Exception:
        raise HTTPException(status_code=500, detail=f"Model did not return valid JSON. Raw: {reply_text}")

    store.end(req.session_id)
    return reply