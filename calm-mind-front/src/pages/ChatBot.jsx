import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import Sidebar from "../components/Sidebar";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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
const LS_LOGS = "cm_stress_logs_v1";
const LS_CHART_VIEW = "cm_chart_view_v1";
const LS_CUSTOM_TAGS = "cm_custom_tags_v1";

function toDateKey(ts) { return dayjs(ts).format("YYYY-MM-DD"); }
function weekStartKey(d) { const offset = (d.day() + 6) % 7; return d.subtract(offset, "day").format("YYYY-MM-DD"); }
function monthKey(d) { return d.startOf("month").format("YYYY-MM"); }

const AMBER = { 500: "#f59e0b", 600: "#d97706" };
const GRID = "#e5e7eb";
const TEXT = "#111827";

export default function ChatBotStressBoard({ tasks = [] }) {
  /* ---------- Chat (localStorage) ---------- */
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(LS_MSGS);
    if (saved) return JSON.parse(saved);
    return [
      { id: "m1", role: "assistant",
        text: "Hi! I’m your coach. Use the Stress Log below to send a message — it will save a log and I’ll reply here.",
        ts: new Date().toISOString() },
    ];
  });
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const [note, setNote] = useState("");

  useEffect(() => { localStorage.setItem(LS_MSGS, JSON.stringify(messages)); }, [messages]);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages, sending]);

  const pushMessage = (role, text) =>
    setMessages((prev) => [...prev, { id: `${Date.now()}-${role}`, role, text, ts: new Date().toISOString() }]);

  const sendThroughBot = async (content) => {
    setSending(true); pushMessage("user", content);
    try { pushMessage("assistant", await getBotResponse(content, messages)); }
    catch { pushMessage("assistant", "Sorry—something went wrong. Please try again."); }
    finally { setSending(false); }
  };

  /* ---------- Stress logging (localStorage) ---------- */
  const [stress, setStress] = useState(3); // 1–5
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState("");

  // default quick tags (removed "Others")
  const baseTagOptions = ["Workload", "Deadline", "Group", "Project", "Personal"];

  // NEW: custom tags (persisted)
  const [customTags, setCustomTags] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_CUSTOM_TAGS) || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(LS_CUSTOM_TAGS, JSON.stringify(customTags)); }, [customTags]);

  const tagOptions = [...baseTagOptions, ...customTags];

  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");

  const addCustomTag = () => {
    const t = newTag.trim().slice(0, 24);
    if (!t) return;
    if (tagOptions.some((x) => x.toLowerCase() === t.toLowerCase())) {
      // if exists, just select it
      setTags((prev) => (prev.includes(t) ? prev : [...prev, t]));
    } else {
      const next = [...customTags, t];
      setCustomTags(next);
      setTags((prev) => (prev.includes(t) ? prev : [...prev, t]));
    }
    setNewTag(""); setAddingTag(false);
  };

  const toggleTag = (t) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem(LS_LOGS);
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => { localStorage.setItem(LS_LOGS, JSON.stringify(logs)); }, [logs]);

  const addLog = (extraNote) => {
    const now = new Date().toISOString();
    const todayKey = toDateKey(now);
    const tasksToday = tasks.filter((t) => t?.dueDate && dayjs(t.dueDate).isSame(todayKey, "day")).length;
    const log = { id: `log-${Date.now()}`, ts: now, stress, tags, note: (extraNote ?? note) || "", tasksCount: tasksToday };
    setLogs((prev) => [log, ...prev]);
  };

  const handleSaveAndAsk = async () => {
    const summary = `Stress: ${stress}/5; Tags: ${tags.length ? tags.join(", ") : "—"}${note ? `; Note: ${note}` : ""}`;
    addLog(); await sendThroughBot(summary); setNote("");
  };

  const stressLabel = useMemo(() => ({ 1:"Very Low",2:"Low",3:"Moderate",4:"High",5:"Very High" }[stress]), [stress]);

  /* ---------- Insights & (reactive) chart data ---------- */
  const today = dayjs();
  const dailyMap = new Map(), weeklyMap = new Map(), monthlyMap = new Map(), yearlyMap = new Map();

  logs.forEach((l) => {
    const d = dayjs(l.ts);
    const dk = toDateKey(l.ts), wk = weekStartKey(d), mk = monthKey(d), yk = d.format("YYYY");
    dailyMap.set(dk, [...(dailyMap.get(dk) || []), l.stress]);
    weeklyMap.set(wk, [...(weeklyMap.get(wk) || []), l.stress]);
    monthlyMap.set(mk, [...(monthlyMap.get(mk) || []), l.stress]);
    yearlyMap.set(yk, [...(yearlyMap.get(yk) || []), l.stress]);
  });

  const avg = (arr) => (arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0);

  const last7 = Array.from({ length: 7 }, (_, i) => today.subtract(6 - i, "day"));
  const dailySeries = last7.map((d) => ({ label: d.format("MM/DD"), value: avg(dailyMap.get(toDateKey(d.toISOString())) || []) }));

  const last8Weeks = Array.from({ length: 8 }, (_, i) => today.subtract(7 * (7 - i), "day"));
  const weeklySeries = last8Weeks.map((d) => {
    const wk = weekStartKey(d); return { label: dayjs(wk).format("MM/DD"), value: avg(weeklyMap.get(wk) || []) };
  });

  const last12Months = Array.from({ length: 12 }, (_, i) => today.subtract(11 - i, "month"));
  const monthlySeries = last12Months.map((d) => { const mk = monthKey(d); return { label: d.format("MMM"), value: avg(monthlyMap.get(mk) || []) }; });

  const last5Years = Array.from({ length: 5 }, (_, i) => today.subtract(4 - i, "year"));
  const yearlySeries = last5Years.map((d) => { const yk = d.format("YYYY"); return { label: yk, value: avg(yearlyMap.get(yk) || []) }; });

  const recentLogs = logs.slice(0, 12);
  const dueToday = useMemo(() => tasks.filter((t) => (t?.dueDate ? dayjs(t.dueDate).isSame(today, "day") : false)), [tasks, today]);

  /* ---------- Recent Logs: Edit/Delete mode ---------- */
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const toggleSelect = (id) => setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const exitEdit = () => { setEditMode(false); setSelectedIds(new Set()); };
  const deleteSelected = () => { if (selectedIds.size === 0) return; setLogs((prev) => prev.filter((l) => !selectedIds.has(l.id))); exitEdit(); };
  const deleteAll = () => { setLogs([]); exitEdit(); };

  /* ---------- Charts: dropdown view + persistence (ALL LINE) ---------- */
  const chartViews = [
    { key: "daily",   label: "Daily Average (7d)",   data: dailySeries,   color: AMBER[500] },
    { key: "weekly",  label: "Weekly Average (8w)",  data: weeklySeries,  color: AMBER[600] },
    { key: "monthly", label: "Monthly Trend (12m)",  data: monthlySeries, color: AMBER[500] },
    { key: "yearly",  label: "Yearly Trend (5y)",    data: yearlySeries,  color: AMBER[600] },
  ];
  const [chartView, setChartView] = useState(() => localStorage.getItem(LS_CHART_VIEW) || "daily");
  useEffect(() => { localStorage.setItem(LS_CHART_VIEW, chartView); }, [chartView]);
  const activeView = chartViews.find((v) => v.key === chartView) || chartViews[0];

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