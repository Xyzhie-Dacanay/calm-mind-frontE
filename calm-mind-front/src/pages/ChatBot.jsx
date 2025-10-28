import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import Sidebar from "../components/Sidebar";

/* ======================== LLM placeholder ======================== */
async function getBotResponse(userMessage, context = [], tasks = []) {
  await new Promise((r) => setTimeout(r, 450));
  return `Got it! You said: “${userMessage.slice(0, 160)}${
    userMessage.length > 160 ? "..." : ""
  }”.
How can I help you today?`;
}

/* ======================== Helpers ======================== */
const LS_MSGS = "cm_messages_v1";
const STORAGE_KEY = "tasks";

export default function ChatBotStressBoard() {
  /* ---------- Tasks from localStorage ---------- */
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newValue = JSON.parse(e.newValue);
          setTasks(Array.isArray(newValue) ? newValue : []);
        } catch {
          setTasks([]);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /* ---------- Chat (localStorage) ---------- */
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(LS_MSGS);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "m1",
        role: "assistant",
        text: "Hi! I’m your coach. Type below to chat (Enter).",
        ts: new Date().toISOString(),
      },
    ];
  });
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    localStorage.setItem(LS_MSGS, JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending]);

  const pushMessage = (role, text) =>
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${role}`, role, text, ts: new Date().toISOString() },
    ]);

  const sendThroughBot = async (content) => {
    setSending(true);
    pushMessage("user", content);
    try {
      const response = await getBotResponse(content, messages, tasks);
      pushMessage("assistant", response);
    } catch {
      pushMessage("assistant", "Sorry—something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    await sendThroughBot(trimmed);
    setNote("");
  };

  /* ======================== UI ======================== */
  return (
    <div className="min-h-screen h-screen flex">
      <Sidebar active="Chat Bot" />
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex-shrink-0 h-[68px] w-full bg-card/50 border-b border-gray-200 px-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Chatbot</h1>
        </div>

        {/* Main */}
        <main className="flex-1 min-h-0 flex">
          <div className="flex-1 flex">
            {/* LEFT: Chat Section */}
            <section
              className="flex-1 flex flex-col gap-3 p-2"
            >
              {/* Chat */}
              <div className="w-full rounded-2xl bg-[#ffffff] border border-gray-200 flex-1 relative flex flex-col overflow-x-hidden">
                <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 overflow-x-hidden">
                  <div className="max-w-3xl mx-auto">
                    {messages.map((m) => (
                      <div key={m.id} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[78%] shadow-sm ${
                            m.role === "user"
                              ? "bg-[#1F1F1D] text-white"
                              : "bg-white text-[#111] border border-gray-200"
                          }`}
                          style={{
                            boxShadow:
                              m.role === "user" ? "0 8px 22px rgba(0,0,0,0.12)" : "0 6px 12px rgba(0,0,0,0.06)",
                          }}
                        >
                          {m.text}
                          <div className="mt-2 text-[11px] opacity-60">{dayjs(m.ts).format("h:mm A")}</div>
                        </div>
                      </div>
                    ))}
                    {sending && (
                      <div className="mb-3 flex justify-start">
                        <div className="rounded-2xl px-4 py-3 text-sm bg-white border border-gray-200 shadow-sm">Typing…</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div
                className="rounded-2xl bg-white border border-gray-100 p-5"
                style={{ boxShadow: "0 6px 18px rgba(11,18,40,0.04)" }}
              >
                <div className="mb-4">
                  <div className="text-lg font-bold">Chat with your Coach</div>
                  <div className="text-xs text-gray-500">Type below to chat (Enter).</div>
                </div>

                {/* Input + Button */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="px-4 py-3 rounded-xl bg-[#222322] text-white disabled:opacity-50"
                    style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}