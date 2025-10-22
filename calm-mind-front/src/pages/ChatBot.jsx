import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
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
async function getBotResponse(userMessage, context = []) {
  await new Promise((r) => setTimeout(r, 450));
  return `Got it! You said: “${userMessage.slice(0, 160)}${userMessage.length > 160 ? "..." : ""}”.
Try a 25-minute focus block, then a 5-minute break.`;
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
    <div className="min-h-screen h-screen">
      <div className="h-full w-full flex">
        <Sidebar active="Chat Bot" />
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="h-[68px] w-full bg-card/50 border-b border-gray-200 px-4 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Chatbot + Stress Dashboard</h1>
            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500">
              <span>Last Log: {logs[0]?.ts ? dayjs(logs[0].ts).format("MMM D, h:mm A") : "—"}</span>
            </div>
          </div>

          {/* Main */}
          <main className="flex-1 min-h-0 grid grid-cols-12 gap-3 px-2 pb-2 pt-2 overflow-hidden">
            {/* LEFT */}
            <section className="col-span-12 lg:col-span-8 flex flex-col gap-3 min-h-0">
              {/* Chat */}
              <div className="w-full rounded-2xl bg-[#F3EFE0] border border-gray-200 h-[calc(60vh-32px)] lg:h-[calc(86vh-320px)] relative flex flex-col overflow-x-hidden">
                <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 overflow-x-hidden">
                  <div className="max-w-3xl mx-auto">
                    {messages.map((m) => (
                      <div key={m.id} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[78%] shadow-sm ${
                            m.role === "user" ? "bg-[#1F1F1D] text-white" : "bg-white text-[#111] border border-gray-200"}`}
                          style={{ boxShadow: m.role === "user" ? "0 8px 22px rgba(0,0,0,0.12)" : "0 6px 12px rgba(0,0,0,0.06)" }}>
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

              {/* Stress Log Input */}
              <div className="rounded-2xl bg-white border border-gray-100 p-5" style={{ boxShadow: "0 6px 18px rgba(11,18,40,0.04)" }}>
                <div className="mb-4">
                  <div className="text-lg font-bold">Log Stress & Message Coach</div>
                  <div className="text-xs text-gray-500">Sending will save a log and post a message to the chatbot above.</div>
                </div>

                {/* Slider */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Stress Level</div>
                  <input type="range" min="1" max="5" step="1" value={stress}
                    onChange={(e) => setStress(parseInt(e.target.value, 10))} className="w-full accent-amber-500" />
                  <div className="flex justify-between text-[11px] text-gray-600 mt-1">{[1,2,3,4,5].map((n)=><span key={n}>{n}</span>)}</div>
                  <div className="mt-1 text-sm text-gray-700">
                    Level: <span className="font-semibold">{{1:"Very Low",2:"Low",3:"Moderate",4:"High",5:"Very High"}[stress]}</span>
                  </div>
                </div>

                {/* Tags (with Add) */}
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-1">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((t) => {
                      const active = tags.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => toggleTag(t)}
                          className={`px-3 py-1.5 rounded-full border text-sm ${active ? "bg-[#222322] text-white" : "bg-white"}`}
                          style={{ boxShadow: "0 4px 10px rgba(11,18,40,0.03)" }}
                        >
                          {t}
                        </button>
                      );
                    })}
                    {!addingTag ? (
                      <button
                        onClick={() => setAddingTag(true)}
                        className="px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-gray-50"
                        title="Add custom tag"
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addCustomTag();
                            if (e.key === "Escape") { setAddingTag(false); setNewTag(""); }
                          }}
                          placeholder="Custom tag"
                          className="h-9 rounded-full border px-3 text-sm"
                          maxLength={24}
                        />
                        <button onClick={addCustomTag} className="px-3 py-1.5 rounded-full bg-[#222322] text-white text-sm">Add</button>
                        <button onClick={() => { setAddingTag(false); setNewTag(""); }} className="px-3 py-1.5 rounded-full bg-white border text-sm">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Note + Send */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSaveAndAsk()}
                    placeholder="What’s stressing you out? (press Enter to send)"
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                  <button onClick={handleSaveAndAsk} className="px-4 py-3 rounded-xl bg-[#222322] text-white" style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}>
                    Send
                  </button>
                </div>
              </div>
            </section>

            {/* RIGHT */}
            <aside className="col-span-12 lg:col-span-4 flex flex-col gap-3 overflow-y-auto pb-2">
              {/* Today’s Insight */}
              <div className="rounded-2xl bg-white border border-gray-100 p-5" style={{ boxShadow: "0 6px 18px rgba(11,18,40,0.04)" }}>
                <div className="text-lg font-bold mb-1">Today’s Insight</div>
                <div className="text-sm text-gray-700">You have <span className="font-semibold">{dueToday.length}</span> task{dueToday.length !== 1 ? "s" : ""} due today.</div>
                {dueToday.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-gray-700">
                    {dueToday.slice(0, 3).map((t, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" /> {t.title}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/" className="px-3 py-1.5 rounded-full bg-[#222322] text-white text-sm">Home</Link>
                  <Link to="/tasks" className="px-3 py-1.5 rounded-full bg-white border text-sm">Task Management</Link>
                  <Link to="/calendar" className="px-3 py-1.5 rounded-full bg-white border text-sm">Calendar</Link>
                  <Link to="/analytics" className="px-3 py-1.5 rounded-full bg-white border text-sm">Analytics</Link>
                </div>
              </div>

              {/* Stress Chart (ALL LINE now) */}
              <div className="rounded-2xl bg-white border border-gray-100 p-4" style={{ boxShadow: "0 6px 18px rgba(11,18,40,0.04)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">{activeView.label}</div>
                  <select
                    value={chartView}
                    onChange={(e) => setChartView(e.target.value)}
                    className="text-sm border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    <option value="daily">Daily Average (7d)</option>
                    <option value="weekly">Weekly Average (8w)</option>
                    <option value="monthly">Monthly Trend (12m)</option>
                    <option value="yearly">Yearly Trend (5y)</option>
                  </select>
                </div>

                <div className="h-44 md:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeView.data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                      <XAxis dataKey="label" stroke={TEXT} fontSize={12} />
                      <YAxis domain={[0, 5]} tickCount={6} stroke={TEXT} fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke={activeView.color} strokeWidth={3} dot={{ r: 3, stroke: activeView.color }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Logs (with Edit/Delete) */}
              <div className="rounded-2xl bg-white border border-gray-100 p-5" style={{ boxShadow: "0 6px 18px rgba(11,18,40,0.04)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold">Recent Logs</div>
                  <div className="flex items-center gap-2">
                    {!editMode ? (
                      <button onClick={() => setEditMode(true)} className="px-3 py-1.5 rounded-full bg-white border text-sm transition-all hover:bg-gray-50">Edit</button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={deleteSelected} className="px-3 py-1.5 rounded-full bg-[#222322] text-white text-sm transition-all" disabled={selectedIds.size === 0}>Delete Selected</button>
                        <button onClick={deleteAll} className="px-3 py-1.5 rounded-full bg-white border text-sm transition-all hover:bg-gray-50">Delete All</button>
                        <button onClick={exitEdit} className="px-3 py-1.5 rounded-full bg-white border text-sm transition-all hover:bg-gray-50">Done</button>
                      </div>
                    )}
                  </div>
                </div>

                {recentLogs.length === 0 ? (
                  <div className="text-sm text-gray-500">No logs yet.</div>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {recentLogs.map((l) => {
                      const checked = selectedIds.has(l.id);
                      return (
                        <li key={l.id} className={`flex items-start justify-between rounded-lg border p-3 transition-all ${editMode ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"}`}>
                          <div className="flex gap-3">
                            {editMode && (
                              <input type="checkbox" className="mt-1 h-4 w-4 accent-amber-500 transition" checked={checked} onChange={() => toggleSelect(l.id)} />
                            )}
                            <div>
                              <div className="font-medium">
                                {dayjs(l.ts).format("MMM D, YYYY")} — {l.tasksCount ?? 0} task{(l.tasksCount ?? 0) !== 1 ? "s" : ""}
                              </div>
                              <div className="text-gray-700">
                                Stress Level: <span className="font-semibold">{l.stress}</span>
                                {l.tags?.length ? `, Tag: ${l.tags[0]}` : ""}
                              </div>
                              {l.note && <div className="text-gray-500 mt-1 italic">“{l.note}”</div>}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">{dayjs(l.ts).format("h:mm A")}</div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}
