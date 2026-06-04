const form = document.getElementById("chat-form");
const input = document.getElementById("question-input");
const chat = document.getElementById("chat");
const quickQuestions = document.querySelectorAll(".quick-question");
const newChatBtn = document.getElementById("new-chat-btn");
const chatHistoryList = document.getElementById("chat-history-list");

const API_BASE_URL = "http://127.0.0.1:8000";
const CONVERSATIONS_KEY = "fontys_conversations";
const CURRENT_CHAT_KEY = "fontys_current_chat_id";
const HISTORY_SEND_LIMIT = 3;

let conversations = [];
let currentChatId = null;
let chatHistory = [];

// --- Storage helpers ---

function saveConversations() {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

function loadConversations() {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCurrentChatId(id) {
  localStorage.setItem(CURRENT_CHAT_KEY, id);
}

function loadCurrentChatId() {
  return localStorage.getItem(CURRENT_CHAT_KEY);
}

function generateId() {
  return "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

// --- UI helpers ---

function scrollChatToBottom() {
  requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;
  });
}

function appendWelcomeMessage() {
  const wrapper = chat.firstElementChild;
  const row = document.createElement("div");
  row.className = "flex";
  const bubble = document.createElement("div");
  bubble.className = "max-w-3xl rounded-2xl bg-[#6f3b6f] px-4 py-3 text-sm leading-7 text-white shadow-sm";
  bubble.textContent = "Hi! I'm the Fontys ICT Assistent. Ask me anything about Fontys ICT regulations, exams, and student support.";
  row.appendChild(bubble);
  wrapper.appendChild(row);
}

function clearChatUI() {
  const wrapper = chat.firstElementChild;
  wrapper.innerHTML = "";
  appendWelcomeMessage();
}

function appendMessage(text, role, sources = []) {
  const row = document.createElement("div");
  row.className = role === "user" ? "flex justify-end" : "flex";

  const bubble = document.createElement("div");
  bubble.className =
    role === "user"
      ? "max-w-3xl rounded-2xl bg-gray-200 px-4 py-3 text-sm leading-7 text-black shadow-sm"
      : "max-w-3xl rounded-2xl bg-[#6f3b6f] px-4 py-3 text-sm leading-7 text-white shadow-sm";

  bubble.textContent = text;
  row.appendChild(bubble);

  if (role === "bot" && sources.length > 0) {
    const sourceBlock = document.createElement("div");
    sourceBlock.className = "mt-3 text-xs text-slate-200";
    sourceBlock.textContent = `Sources: ${sources.join(", ")}`;
    bubble.appendChild(sourceBlock);
  }

  const wrapper = chat.firstElementChild;
  wrapper.appendChild(row);
  scrollChatToBottom();
}

function addThinkingMessage() {
  const row = document.createElement("div");
  row.className = "flex";
  row.id = "thinking-row";

  const bubble = document.createElement("div");
  bubble.className = "max-w-3xl rounded-2xl bg-[#6f3b6f] px-4 py-3 text-sm text-slate-100 shadow-sm";
  bubble.textContent = "Fontys ICT Assistent is thinking...";

  row.appendChild(bubble);
  chat.firstElementChild.appendChild(row);
  scrollChatToBottom();
}

function removeThinkingMessage() {
  const thinking = document.getElementById("thinking-row");
  if (thinking) thinking.remove();
  scrollChatToBottom();
}

// --- Chat history sidebar ---

function renderChatHistoryList() {
  chatHistoryList.innerHTML = "";

  if (conversations.length === 0) {
    const empty = document.createElement("p");
    empty.className = "text-xs text-white/40 px-3 py-2";
    empty.textContent = "No conversations yet.";
    chatHistoryList.appendChild(empty);
    return;
  }

  conversations.forEach((conv) => {
    const btn = document.createElement("button");
    btn.className =
      conv.id === currentChatId
        ? "w-full text-left px-3 py-2 rounded-xl bg-white/20 text-sm text-white truncate"
        : "w-full text-left px-3 py-2 rounded-xl text-sm text-white/75 truncate transition hover:bg-white/10";
    btn.textContent = conv.title;
    btn.title = conv.title;
    btn.addEventListener("click", () => switchToChat(conv.id));
    chatHistoryList.appendChild(btn);
  });
}

// --- Conversation management ---

function createNewChat() {
  const conv = {
    id: generateId(),
    title: "New conversation",
    createdAt: new Date().toISOString(),
    messages: [],
  };
  conversations.unshift(conv);
  saveConversations();
  switchToChat(conv.id);
}

function switchToChat(id) {
  currentChatId = id;
  saveCurrentChatId(id);

  const conv = conversations.find((c) => c.id === id);
  chatHistory = conv ? [...conv.messages] : [];

  clearChatUI();
  chatHistory.forEach(({ role, content, sources }) => {
    appendMessage(content, role === "assistant" ? "bot" : "user", sources || []);
  });

  renderChatHistoryList();
  scrollChatToBottom();
}

// --- Ask question ---

async function askQuestion(question) {
  appendMessage(question, "user");
  addThinkingMessage();

  const historyToSend = chatHistory
    .slice(-HISTORY_SEND_LIMIT)
    .map(({ role, content }) => ({ role, content }));

  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, k: 2, history: historyToSend }),
    });

    const data = await response.json();
    removeThinkingMessage();

    if (!response.ok) {
      appendMessage("Sorry, something went wrong while contacting the assistant.", "bot");
      console.error(data);
      return;
    }

    appendMessage(data.answer, "bot", data.sources || []);

    chatHistory.push({ role: "user", content: question });
    chatHistory.push({ role: "assistant", content: data.answer, sources: data.sources || [] });

    const conv = conversations.find((c) => c.id === currentChatId);
    if (conv) {
      if (conv.title === "New conversation") {
        conv.title = question.length > 40 ? question.slice(0, 40) + "…" : question;
      }
      conv.messages = [...chatHistory];
      saveConversations();
    }

    renderChatHistoryList();

  } catch (error) {
    removeThinkingMessage();
    appendMessage(`Connection error: ${error.message}`, "bot");
    console.error("Fetch error:", error);
  }
}

// --- Event listeners ---

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question) return;
  input.value = "";
  await askQuestion(question);
  input.focus();
});

quickQuestions.forEach((button) => {
  button.addEventListener("click", async () => {
    await askQuestion(button.textContent.trim());
    input.focus();
  });
});

newChatBtn.addEventListener("click", createNewChat);

// --- Init ---

window.addEventListener("load", () => {
  // Migrate old single-chat storage
  localStorage.removeItem("fontys_chat_history");

  conversations = loadConversations();
  const savedId = loadCurrentChatId();
  const found = conversations.find((c) => c.id === savedId);

  if (found) {
    switchToChat(found.id);
  } else if (conversations.length > 0) {
    switchToChat(conversations[0].id);
  } else {
    createNewChat();
  }
});
