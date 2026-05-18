const form = document.getElementById("chat-form");
const input = document.getElementById("question-input");
const chat = document.getElementById("chat");
const quickQuestions = document.querySelectorAll(".quick-question");

const API_BASE_URL = "http://127.0.0.1:8000";

function appendMessage(text, role, sources = []) {
  const row = document.createElement("div");
  row.className = role === "user" ? "flex justify-end" : "flex";

  const bubble = document.createElement("div");
  bubble.className =
    role === "user"
      ? "max-w-3xl rounded-2xl bg-cyan-500 px-4 py-3 text-sm leading-7 text-slate-950 shadow-lg"
      : "max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-7 text-slate-200 shadow-lg";

  bubble.textContent = text;
  row.appendChild(bubble);

  if (role === "bot" && sources.length > 0) {
    const sourceBlock = document.createElement("div");
    sourceBlock.className = "mt-3 text-xs text-slate-400";
    sourceBlock.textContent = `Sources: ${sources.join(", ")}`;
    bubble.appendChild(sourceBlock);
  }

  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function addThinkingMessage() {
  const row = document.createElement("div");
  row.className = "flex";
  row.id = "thinking-row";

  const bubble = document.createElement("div");
  bubble.className =
    "max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400 shadow-lg";
  bubble.textContent = "Nova Assistant is thinking...";

  row.appendChild(bubble);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function removeThinkingMessage() {
  const thinking = document.getElementById("thinking-row");
  if (thinking) thinking.remove();
}

async function askQuestion(question) {
  appendMessage(question, "user");
  addThinkingMessage();

  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        k: 2,
      }),
    });

    const data = await response.json();
    removeThinkingMessage();

    if (!response.ok) {
      appendMessage("Sorry, something went wrong while contacting the assistant.", "bot");
      console.error(data);
      return;
    }

    appendMessage(data.answer, "bot", data.sources || []);
  } catch (error) {
    removeThinkingMessage();
    appendMessage(`Connection error: ${error.message}`, "bot");
    console.error("Fetch error:", error);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question) return;

  input.value = "";
  await askQuestion(question);
});

quickQuestions.forEach((button) => {
  button.addEventListener("click", async () => {
    await askQuestion(button.textContent.trim());
  });
});