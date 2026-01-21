# 🤖 Simple Chat Bot like OpenAI

A lightweight **OpenAI-inspired chat bot** built using **FastAPI** for the backend and **HTML, CSS, and JavaScript** for the frontend.  
This project demonstrates how to integrate **Large Language Models (LLMs)** using **OpenRouter** with a clean, modern chat interface that supports **code understanding and file-based conversations**.

---

## 🚀 Features

- 💬 Real-time AI chat interface  
- 🧠 LLM-powered responses via OpenRouter  
- 🧩 Multiple AI interaction modes:
  - Normal Chat
  - Line-by-line Code Explanation
  - Debug Walkthrough
  - Interview-style Explanation
  - Code Improvement & Refactoring
- 📎 Upload code/text files and ask questions about them
- 🧾 Syntax-highlighted code blocks with copy button
- 🌙 Modern dark-mode UI
- ⚡ FastAPI backend with CORS enabled

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript (Vanilla)
- Tailwind CSS (CDN)

### Backend
- Python
- FastAPI
- OpenRouter API (LLM access)
- Requests
- python-dotenv

---

## 📁 Project Structure
```bash

Simple-chat-bot-like-openAI/
│
├── backend/
│ ├── app.py # FastAPI backend
│ ├── requirements.txt # Python dependencies
│
├── frontend/
│ ├── index.html # Main UI
│ ├── styles.css # Custom styles
│ ├── app.js # Chat logic & API calls
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/coddyieee-sketch/Simple-chat-bot-like-openAI.git
cd Simple-chat-bot-like-openAI
```

2️⃣ Backend Setup
```bash
Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
```
Install dependencies
```bash
pip install -r requirements.txt
```
3️⃣ Environment Variables

Create a .env file inside the backend folder:
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

🔑 Get your API key from: https://openrouter.ai

4️⃣ Run Backend Server
```bash
uvicorn app:app --reload --port 3000
```

Backend will run at:
```bash
http://localhost:3000
```

Health check endpoint:
```bash
GET /api/health
```
5️⃣ Frontend Setup

Open index.html directly in your browser
(or use Live Server in VS Code for best experience).

🧠 How It Work

User enters a prompt or uploads a file
Frontend sends request to /api/chat

Backend:

Detects intent (chat, debug, improve, interview, etc.)
Selects the appropriate system prompt
Sends request to OpenRouter LLM
AI response is returned and rendered in the UI
Uploaded files are automatically injected into the prompt as persistent context.

📎 Supported File Types
You can upload and chat about:
.txt
.md
.py
.js
.java
.json
.html
.css

🔐 Security Notes

Never expose API keys in frontend code
Restrict CORS origins in production
Add authentication before public deployment

🌱 Future Enhancements

🔒 User authentication
💾 Chat history persistence
🖼️ Image understanding
📄 Backend PDF parsing
🤖 Model selection dropdown
☁️ Docker & cloud deployment
