# backend/services/prompt_loader.py

from pathlib import Path

PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"


class PromptLoader:
    def load_prompt(self, filename: str) -> str:
        path = PROMPT_DIR / filename
        return path.read_text(encoding="utf-8")

    def load_all_prompts(self) -> dict:
        prompts = {}
        for file in sorted(PROMPT_DIR.glob("*.md")):
            prompts[file.name] = file.read_text(encoding="utf-8")
        return prompts

    def build_system_prompt(self) -> str:
        files = [
            "system_prompt.md",
            "spoken_interaction.md",
            "interview_flow.md",
            "question_generation.md",
            "feedback_and_scoring.md",
        ]

        sections = [self.load_prompt(f) for f in files]
        return "\n\n".join(sections)