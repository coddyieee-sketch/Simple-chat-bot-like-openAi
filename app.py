from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
import os

# -------------------------------------------------
# Load environment variables
# -------------------------------------------------
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not set")

# -------------------------------------------------
# FastAPI app
# -------------------------------------------------
app = FastAPI(title="CodeAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# OpenRouter config
# -------------------------------------------------
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:5500",
    "X-Title": "CodeAI",
}

REQUEST_TIMEOUT = 45

# -------------------------------------------------
# SYSTEM PROMPTS (MODES)
# -------------------------------------------------

LINE_BY_LINE_PROMPT = """
You are CodeAI in LINE-BY-LINE EXPLAIN MODE.

Explain the code from top to bottom.

Rules:
- Follow code order
- Explain WHY each block exists
- Group related lines
- Avoid vague summaries

Format:
1. Section title
2. Clear explanation
3. Use code blocks ONLY when quoting code
"""

DEBUG_PROMPT = """
You are CodeAI in DEBUG WALKTHROUGH MODE.

Rules:
- Walk through execution step-by-step
- Track variable values and state
- Point out bugs, edge cases, or risks
- Mention performance issues if any

Format:
- Step-by-step execution explanation
"""

INTERVIEW_PROMPT = """
You are CodeAI in INTERVIEW EXPLANATION MODE.

Rules:
- Explain like a senior engineer
- Focus on architecture and decisions
- Mention trade-offs and scalability
- Be confident and structured

Format:
- Overview
- Key decisions
- Improvements
"""

IMPROVE_PROMPT = """
You are CodeAI in CODE IMPROVEMENT MODE.

Rules:
1. List issues
2. Suggest improvements
3. Provide improved code ONLY if needed

Format:
Issues:
- ...

Improvements:
- ...

Improved Code:
```python
"""
DEFAULT_PROMPT = """
You are CodeAI, an expert software engineer and tutor.

Behavior:
- Understand pasted code
- Answer directly
- Be structured and clear

Formatting:
- Normal text for explanations
- Code blocks ONLY for actual code
"""

SYSTEM_PROMPTS = {
    "line-by-line": LINE_BY_LINE_PROMPT,
    "debug": DEBUG_PROMPT,
    "interview": INTERVIEW_PROMPT,
    "improve": IMPROVE_PROMPT,
}

# -------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------
@app.get("/")
@app.get("/api/health")
def health():
    return {"status": "ok"}

# -------------------------------------------------
# CHAT ENDPOINT
# -------------------------------------------------
@app.post("/api/chat")
def chat(payload: dict):
    user_message = payload.get("message", "").strip()
    mode = payload.get("mode", "default")

    if not user_message:
        return {"reply": "Please provide a message."}

    # Auto-detect mode from user text
    msg = user_message.lower()
    if "line by line" in msg or "line-by-line" in msg:
        mode = "line-by-line"
    elif "debug" in msg or "walkthrough" in msg:
        mode = "debug"
    elif "interview" in msg:
        mode = "interview"
    elif "improve" in msg or "optimize" in msg or "refactor" in msg:
        mode = "improve"

    system_prompt = SYSTEM_PROMPTS.get(mode, DEFAULT_PROMPT)

    body = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.15,
        "max_tokens": 1200,
    }

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=HEADERS,
            json=body,
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        return {"reply": f"Network error: {e}"}

    if "choices" not in data:
        return {"reply": f"OpenRouter error: {data}"}

    reply = data["choices"][0]["message"].get("content", "").strip()
    return {"reply": reply or "No response generated."}

