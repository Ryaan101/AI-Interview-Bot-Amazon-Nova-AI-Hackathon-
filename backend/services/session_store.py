# backend/services/session_store.py

import uuid
from typing import Dict, Any


class SessionStore:
    """
    Simple in-memory session storage.
    Hackathon-friendly. Replace with DynamoDB later if needed.
    """
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "history": [],     # list of {"role": "user"/"assistant", "text": "..."}
            "ended": False
        }
        return session_id

    def get(self, session_id: str) -> Dict[str, Any]:
        return self.sessions.get(session_id)

    def append(self, session_id: str, role: str, text: str) -> None:
        self.sessions[session_id]["history"].append({"role": role, "text": text})

    def end(self, session_id: str) -> None:
        self.sessions[session_id]["ended"] = True