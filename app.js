(() => {
  /* ------------------ API CONFIG ------------------ */

  const API_BASE = "http://localhost:3000";
  const CHAT_API = `${API_BASE}/api/chat`;

  /* ------------------ DOM ELEMENTS ------------------ */

  const messagesEl = document.getElementById("messages");
  const chatContainer = document.getElementById("chatContainer");
  const promptInput = document.getElementById("promptInput");
  const sendBtn = document.getElementById("sendBtn");
  const fileInput = document.getElementById("fileInput");
  const attachBtn = document.getElementById("attachBtn");
  const clearChatBtn = document.getElementById("clearChatBtn");
  const modeTabs = document.querySelectorAll(".mode-tab");
  const typingIndicator = document.getElementById("typingIndicator");

  /* ------------------ STATE ------------------ */

  let mode = "chat";
  let isSending = false;

  // 🔥 Persist uploaded file context
  let uploadedFileContext = "";

  /* ------------------ UI HELPERS ------------------ */

  function scrollBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function setTyping(on) {
    typingIndicator.classList.toggle("hidden", !on);
  }

  function addMessage(role, content) {
    const wrapper = document.createElement("div");
    wrapper.className = `flex ${role === "user" ? "justify-end" : "justify-start"} msg-enter`;

    const bubble = document.createElement("div");
    bubble.className = `message ${role === "user" ? "user" : "ai"}`;

    bubble.appendChild(renderRichText(content));
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    scrollBottom();
  }

  /* ------------------ RICH TEXT + CODE RENDERING ------------------ */

  function renderRichText(text) {
    const container = document.createElement("div");
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const p = document.createElement("p");
        p.textContent = text.slice(lastIndex, match.index);
        container.appendChild(p);
      }

      const codeBlock = document.createElement("div");
      codeBlock.className = "code-block";

      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = match[2].trim();
      pre.appendChild(code);

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "Copy";
      copyBtn.onclick = async () => {
        await navigator.clipboard.writeText(code.textContent);
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
      };

      codeBlock.appendChild(copyBtn);
      codeBlock.appendChild(pre);
      container.appendChild(codeBlock);

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      const p = document.createElement("p");
      p.textContent = text.slice(lastIndex);
      container.appendChild(p);
    }

    return container;
  }

  /* ------------------ MODE TABS ------------------ */

  modeTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      modeTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      promptInput.placeholder =
        mode === "code"
          ? "Ask about the uploaded code or paste code…"
          : "Ask something…";
    });
  });

  /* ------------------ FILE UPLOAD ------------------ */

  attachBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const allowed = [
      ".txt", ".md", ".py", ".js", ".java",
      ".json", ".html", ".css"
    ];

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      alert("Only text or code files are supported");
      fileInput.value = "";
      return;
    }

    const text = await file.text();

    // 🔥 Persist file context for AI
    uploadedFileContext =
      `The user uploaded the following file.\n\n` +
      `Filename: ${file.name}\n\n` +
      `Content:\n` +
      `\`\`\`\n${text.slice(0, 12000)}\n\`\`\`\n\n` +
      `Use this file to answer all future questions unless told otherwise.`;

    addMessage(
      "user",
      `📎 File uploaded: ${file.name}\n\n\`\`\`\n${text.slice(0, 6000)}\n\`\`\``
    );

    fileInput.value = "";
  });

  /* ------------------ SEND MESSAGE ------------------ */

  sendBtn.addEventListener("click", sendMessage);
  promptInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  async function sendMessage() {
    if (isSending) return;

    const userText = promptInput.value.trim();
    if (!userText) return;

    isSending = true;
    setTyping(true);

    addMessage("user", userText);
    promptInput.value = "";

    // 🔥 Inject file context automatically
    const finalPrompt = uploadedFileContext
      ? `${uploadedFileContext}\n\nUser question:\n${userText}`
      : userText;

    try {
      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalPrompt })
      });

      const data = await res.json();
      addMessage("assistant", data.reply || "No response");

    } catch (err) {
      console.error(err);
      addMessage("assistant", "❌ Backend error");
    } finally {
      isSending = false;
      setTyping(false);
    }
  }

  /* ------------------ CLEAR CHAT ------------------ */

  function clearChat() {
    if (!confirm("Clear chat and AI memory?")) return;

    messagesEl.innerHTML = "";
    uploadedFileContext = "";
    promptInput.value = "";
    isSending = false;
    setTyping(false);

    addMessage(
      "assistant",
      "✅ Chat cleared\n\n• Ask new questions"
    );
  }

  clearChatBtn.addEventListener("click", clearChat);

  /* ------------------ INIT ------------------ */

  function init() {
    addMessage(
      "assistant",
      "Hi 👋"
    );
  }

  init();
})();
