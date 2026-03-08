# AI Interview Bot — Amazon Nova AI Hackathon

An AI-powered mock technical interview simulator built with **Amazon Nova** (via AWS Bedrock) and **FastAPI**. The bot conducts realistic software engineering interviews, asks follow-up questions, and generates a detailed feedback report at the end.

https://devpost.com/software/interviewai-u7lvyx
---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) |
| AI Model | Amazon Nova Lite (`amazon.nova-lite-v1:0`) |
| AI Provider | [AWS Bedrock](https://aws.amazon.com/bedrock/) via `boto3` |
| Session Storage | In-memory (Python dict) |
| Prompt System | Markdown files loaded at runtime |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Speech Input | Web Speech API (browser built-in) |

---

## Prerequisites

- Python 3.10 or higher
- An AWS account with Bedrock access enabled
- AWS credentials configured locally (`aws configure` or environment variables)
- The **Amazon Nova Lite** model enabled in your AWS Bedrock console (us-east-1 by default)

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `AWS_REGION` | `us-east-1` | AWS region for Bedrock |
| `NOVA_MODEL_ID` | `amazon.nova-lite-v1:0` | Bedrock model ID |

These can be set in a `.env` file or exported in your shell before running.

---

## Setup & Running

### macOS / Linux

```bash
# 1. Clone the repo
git clone https://github.com/Ryaan101/AI-Interview-Bot-Amazon-Nova-AI-Hackathon-/
cd AI-Interview-Bot-Amazon-Nova-AI-Hackathon-

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Start the server
cd backend
uvicorn app:app --reload
```

### Windows

```powershell
# 1. Clone the repo
git clone https://github.com/Ryaan101/AI-Interview-Bot-Amazon-Nova-AI-Hackathon-/
cd AI-Interview-Bot-Amazon-Nova-AI-Hackathon-

# 2. Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r backend\requirements.txt

# 4. Start the server
cd backend
uvicorn app:app --reload
```

---

## API Endpoints

Once running, the server is available at `http://127.0.0.1:8000`.
Visit `http://127.0.0.1:8000/docs` for the interactive Swagger UI.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/start` | Start a new interview session for a given role |
| `POST` | `/turn` | Submit a candidate answer and receive the next question |
| `POST` | `/end` | End the interview and receive a full feedback report |

### Example: Start an interview

```json
POST /start
{
  "role": "Software Engineer"
}
```

### Example: Submit an answer

```json
POST /turn
{
  "session_id": "<uuid from /start>",
  "text": "I would use a hash map to solve this in O(n) time..."
}
```

### Example: End the interview

```json
POST /end
{
  "session_id": "<uuid from /start>"
}
```
