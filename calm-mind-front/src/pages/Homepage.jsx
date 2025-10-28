import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import Sidebar from "../components/Sidebar"; // adjust path if needed
import { ThemeContext } from '../context/ThemeContext';
import Card from "../components/HoverCard";
import { useNavigate } from "react-router-dom";

// Recharts (match Analytics/Chatbot styling)
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const STORAGE_KEY_TASKS = "tasks";
const FALLBACK_TASKS = "cm-tasks";
const LS_STRESS_A = "cm_stress_logs_v1";
const LS_STRESS_B = "cm-stress"; // legacy/alt key used elsewhere
const CHATBOT_ROUTE = "/chatbot";
const TASKS_ROUTE = "/tasks";
const CALENDAR_ROUTE = "/calendar";

// Palette to match your theme
const AMBER = "#B9A427";
const GRID = "#e5e7eb";
const TEXT = "#111827";

/* ---------------------------- tiny date helpers ---------------------------- */
const toDate = (v) => { const d = new Date(v); d.setHours(0,0,0,0); return d; };
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

// Read tasks from localStorage (robust)
function readTasks() {
  try {
    const a = localStorage.getItem(STORAGE_KEY_TASKS);
    if (a) return JSON.parse(a) || [];
    const b = localStorage.getItem(FALLBACK_TASKS);
    if (b) return JSON.parse(b) || [];
  } catch {}
  return [];
}

// Read stress logs (support both keys)
function readStressLogs() {
  try {
    const a = localStorage.getItem(LS_STRESS_A);
    if (a) return JSON.parse(a) || [];
    const b = localStorage.getItem(LS_STRESS_B);
    if (b) return JSON.parse(b) || [];
  } catch {}
  return [];
}

export default function HomePage() {
  const { theme, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  /* ----------------------- Live tasks from localStorage ---------------------- */
  const [tasksLS, setTasksLS] = useState(readTasks);
  const lastTasks = useRef(JSON.stringify(tasksLS));

  useEffect(() => {
    const syncTasks = () => {
      const cur = readTasks();
      const s = JSON.stringify(cur);
      if (s !== lastTasks.current) {
        lastTasks.current = s;
        setTasksLS(cur);
      }
    };
    const onStorage = (e) => {
      if ([STORAGE_KEY_TASKS, FALLBACK_TASKS].includes(e.key)) syncTasks();
    };
    // small poll to catch same-tab changes
    const id = setInterval(syncTasks, 1000);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncTasks);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncTasks);
      clearInterval(id);
    };
  }, []);

  /* ---------------------------- Auto-Missing logic --------------------------- */
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const startOfTodayTS = useMemo(() => {
    const d = new Date(now); d.setHours(0,0,0,0); return d.getTime();
  }, [now]);
  const isPast = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return false;
    const t = new Date(`${yyyy_mm_dd}T00:00:00`).getTime();
    return t < startOfTodayTS;
  };
  const deriveStatus = (task) => {
    if (task.status === "completed") return "completed";
    if (isPast(task.dueDate)) return "missing";
    return task.status || "todo";
  };

  /* ---------------------- Counts for Overall Information --------------------- */
  const counts = useMemo(() => {
    const c = { todo: 0, in_progress: 0, missing: 0, completed: 0, total: 0 };
    tasksLS.forEach(t => { c[deriveStatus(t)]++; c.total++; });
    return c;
  }, [tasksLS]);

  /* ---------------- Your Tasks: first 3 (live, sorted) ---------------- */
  const topTasks = useMemo(() => {
    const parseTS = (t) => {
      if (t?.dueDate) return new Date(`${t.dueDate}T00:00:00`).getTime();
      const idNum = Number(t?.id);
      return Number.isFinite(idNum) ? idNum : 9e15; // undated -> end
    };
    return [...tasksLS].sort((a, b) => parseTS(a) - parseTS(b)).slice(0, 3);
  }, [tasksLS]);

  /* ------------------- Stress Level Over Time (line) ------------------- */
  // Live-read stress logs
  const [stressLogs, setStressLogs] = useState(readStressLogs);
  const lastStress = useRef(JSON.stringify(stressLogs));

  useEffect(() => {
    const syncStress = () => {
      const cur = readStressLogs();
      const s = JSON.stringify(cur);
      if (s !== lastStress.current) {
        lastStress.current = s;
        setStressLogs(cur);
      }
    };
    const onStorage = (e) => {
      if ([LS_STRESS_A, LS_STRESS_B].includes(e.key)) syncStress();
    };
    const id = setInterval(syncStress, 1000);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncStress);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncStress);
      clearInterval(id);
    };
  }, []);

  // Build last 7 daily averages from stress logs (1–5)
  const stressSeries7d = useMemo(() => {
    const today = toDate(new Date());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const key = ymd(d);
      return { key, label: d.toLocaleDateString(undefined, { weekday: "short" }) };
    });

    const bucket = new Map(days.map(({ key }) => [key, []]));
    (stressLogs || []).forEach((l) => {
      const ts = l.ts || l.date; // support both shapes
      if (!ts) return;
      const k = ymd(new Date(ts));
      if (bucket.has(k)) bucket.get(k).push(Number(l.stress || 0));
    });

    return days.map(({ key, label }) => {
      const arr = bucket.get(key) || [];
      const avg = arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;
      return { label, value: avg };
    });
  }, [stressLogs]);

  const hasStressData = stressSeries7d.some(d => d.value > 0);

  /* ---------------- Calendar Logic ---------------- */
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const monthName = useMemo(() => selectedDate.toLocaleString(undefined, { month: 'long', year: 'numeric' }), [selectedDate]);

  const daysGrid = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const leading = firstOfMonth.getDay();
    const totalDays = lastOfMonth.getDate();

    const arr = [];
    for (let i = 0; i < leading; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [selectedDate]);

  const realToday = useMemo(() => new Date(), []);
  const todayYMD = useMemo(() => ({
    y: realToday.getFullYear(),
    m: realToday.getMonth(),
    d: realToday.getDate()
  }), [realToday]);

  const taskDates = useMemo(() => {
    const set = new Set();
    tasksLS.forEach(t => {
      if (t.dueDate) {
        set.add(t.dueDate);
      }
    });
    return set;
  }, [tasksLS]);

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (dayNum) => {
    if (!dayNum) return;
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    navigate(`${CALENDAR_ROUTE}?date=${dateStr}`);
  };

  /* -------------------------------------------------------------------- */
  return (
    <div className="min-h-screen h-screen">
      <div className="h-full w-full flex">
        {/* Reusable Sidebar */}
        <Sidebar active="Home" />

        {/* Right column */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Responsive: stacked on small, 12-column grid on lg+ */}
          <main className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-3 px-2 pb-2 pt-2 overflow-hidden">

            {/* Header */}
            <div className="col-span-12">
              <Card className="h-20 md:h-[80px] w-full px-4 flex items-center justify-between hover:shadow-none hover:-translate-y-0 hover:bg-inherit cursor-default">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Home</h1>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 bg-card rounded-full px-2 py-2 border border-gray-200">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input placeholder="Search" className="outline-none text-sm placeholder:text-gray-400 bg-transparent" />
                  </div>
                  <button className="h-10 w-10 grid place-items-center rounded-full bg-card border border-gray-200 shadow-sm">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="19" r="1" />
                      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14v-3a6 6 0 1 0-12 0v3a2 2 0 0 1-.6 1.4L4 17h5" />
                    </svg>
                  </button>
                  <button className="h-10 w-10 grid place-items-center rounded-full bg-card border border-gray-200 shadow-sm">
                    <span className="text-base">👤</span>
                  </button>
                </div>
              </Card>
            </div>

            {/* Left grid: full-width on small, 8/12 on lg+ */}
            <section className="col-span-12 lg:col-span-8 grid grid-rows-[200px_120px_324px_auto] grid-cols-12 gap-3 h-full min-h-0">

              {/* Overall Information */}
              <Card className="col-span-12 md:col-span-6 row-span-2 text-primary p-4 relative overflow-hidden h-full panel-overall">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-medium tracking-tight text-primary">Overall Information</h2>
                  <button aria-label="More options" className="text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">⋮</button>
                </div>

                <div className="mt-1 grid grid-cols-2 gap-1">
                  <div>
                    {/* Completed count */}
                    <div className="text-6xl font-bold text-accent leading-none">{counts.completed}</div>
                    <div className="text-sm text-gray-300 mt-2">Tasks done for all time</div>
                    <div className="mt-10 overall-pill" aria-hidden="true" />
                  </div>
                  <div>
                    {/* Missing count */}
                    <div className="text-6xl font-bold text-accent leading-none">{counts.missing}</div>
                    <div className="text-sm text-gray-300 mt-2">Missing</div>
                  </div>
                </div>

                {/* Mini-stat cards */}
                <div className="mt-8 grid grid-cols-3 gap-5 justify-items-center">
                  {[["Tasks", String(counts.todo), "M11 7h8M6 12h14M6 17h14"], ["In Progress", String(counts.in_progress), "M12 6v6l4 2"], ["Completed", String(counts.completed), "m5 13 4 4L19 7"]].map(([label, value, iconPath]) => (
                    <Card key={label} className="text-primary p-4 flex flex-col items-center justify-center gap-3 h-32 w-36 md:w-28">
                      <div className="h-10 w-6 rounded-full bg-card grid place-items-center shadow-sm text-accent">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={iconPath} />
                        </svg>
                      </div>
                      <div className="text-4xl md:text-5xl font-extrabold leading-7 text-primary">{value}</div>
                      <div className="text-[12px] uppercase tracking-wide text-gray-500">{label}</div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Help card */}
              <Card className="col-span-12 md:col-span-6 p-6 h-full flex flex-col items-center justify-center text-center panel-help">
                <h3 className="text-xl font-extrabold">Need Some Help?</h3>
                <p className="text-m text-gray-600 mt-2 leading-relaxed max-w-[32rem]">Let the AI Coach plan your next 25 minutes.</p>
                <button
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent on-accent font-semibold shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                  aria-label="Open Coach"
                  onClick={() => navigate(CHATBOT_ROUTE)}
                >
                  Open Coach
                </button>
              </Card>

              {/* Mood -> Log stress */}
              <Card className="col-span-12 md:col-span-6 text-primary p-6 h-full flex flex-col items-center justify-center text-center panel-mood">
                <div className="text-accent font-black italic text-lg tracking-wide">How are you feeling right now?</div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => navigate(CHATBOT_ROUTE)}
                    className="px-6 py-3 rounded-xl bg-accent on-accent font-semibold shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Log stress"
                  >
                    Log stress
                  </button>
                </div>
              </Card>

              {/* Calendar (responsive) */}
              <Card className="pt-3 pr-6 pl-6 col-span-12 md:col-span-7 p-1 h-full flex flex-col">
                <div className="-mt-2 flex items-center justify-between px-2">
                  <button aria-label="Prev month" className="mt-3 h-8 w-8 grid place-items-center rounded-full bg-white/60 text-gray-700 hover:bg-card shadow-sm" onClick={handlePrevMonth}>‹</button>
                  <div className="pt-3 font-extrabold text-center text-base">{monthName}</div>
                  <button aria-label="Next month" className="mt-3 h-8 w-8 grid place-items-center rounded-full bg-white/60 text-gray-700 hover:bg-card shadow-sm" onClick={handleNextMonth}>›</button>
                </div>
                <div className="grid grid-cols-7 text-center text-[12px] font-medium text-gray-600 mb-0 p-3">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={`${d}-${i}`} className="py-1 tracking-wider uppercase">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0 mb-0 text-center text-sm auto-rows-[minmax(36px,1fr)] h-full px-3 pb-3">
                  {daysGrid.map((dayNum, idx) => {
                    const year = selectedDate.getFullYear();
                    const month = selectedDate.getMonth();
                    const dateStr = dayNum ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` : null;
                    const hasTask = dateStr && taskDates.has(dateStr);
                    const isToday = dayNum && year === todayYMD.y && month === todayYMD.m && dayNum === todayYMD.d;
                    return (
                      <button
                        key={idx}
                        className={`flex flex-col items-center justify-center rounded-md transition-colors duration-150 ${isToday ? "bg-accent on-accent font-extrabold shadow-md" : "hover:bg-card text-gray-700"}`}
                        onClick={() => handleDateClick(dayNum)}
                        disabled={!dayNum}
                      >
                        <span className={`${isToday ? "text-base" : "text-sm"}`}>{dayNum ?? ""}</span>
                        {hasTask && <div className="w-1 h-1 rounded-full bg-accent mx-auto mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Notifications */}
              <Card className="col-span-12 md:col-span-5 row-span-2 text-primary p-4 relative overflow-hidden h-82 panel-notifications">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-medium tracking-tight text-primary">Notifications</h2>
                </div>
                <div className="mt-1">
                  <div className="text-lg font-semibold text-gray-700">No new notifications</div>
                  <div className="mt-4 text-sm text-gray-400">You have no unread messages or updates at the moment.</div>
                </div>
              </Card>
            </section>

            {/* Right sidebar content: full-width on small, 4/12 on lg+ */}
            <section className="col-span-12 lg:col-span-4 grid grid-rows-[120px_200px_100px_auto] gap-2 h-full min-h-0">

              {/* Profile + Stress Level Over Time (LINE CHART) */}
              <Card className="row-span-2 p-8 h-full relative">
                <div className="avatar-abs h-20 w-20 rounded-full bg-accent overflow-hidden place-items-center text-3xl on-accent">👩🏻‍💼</div>
                <div>
                  <h2 className="p-1 font-bold text-m tracking-tight">Goodmorning, Dodi!</h2>
                  <div className="p-1 ml-1 mb-5 text-sm text-gray-500">Vivamus sed tortor in ante placerat auctor.</div>
                </div>

                {/* Recharts LineChart fed by stress logs */}
                <div className="h-40 md:h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stressSeries7d}
                      margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                      <XAxis dataKey="label" stroke={TEXT} fontSize={12} />
                      <YAxis domain={[0, 5]} tickCount={6} stroke={TEXT} fontSize={12} />
                      <Tooltip
                        formatter={(v) => [`${v}`, "Avg Stress"]}
                        labelFormatter={(l) => `Day: ${l}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={AMBER}
                        strokeWidth={3}
                        dot={{ r: 3, stroke: AMBER }}
                        name="Avg Stress"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {!hasStressData && (
                  <div className="mt-2 text-xs text-gray-500">
                    No recent stress logs yet. Log your stress in the Coach to see trends here.
                  </div>
                )}
              </Card>

              {/* Your Tasks */}
              <Card className="mt-2 row-span-1 p-2 flex flex-col h-fit">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold tracking-tight">Your Tasks</h2>
                  <button
                    aria-label="Add Task"
                    className="h-7 w-7 rounded-full bg-card grid place-items-center hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    onClick={() => navigate(TASKS_ROUTE)}
                  >
                    <span className="font-black">＋</span>
                  </button>
                </div>

                <div className="mt-2 space-y-1 flex-1 overflow-hidden">
                  {(topTasks.length ? topTasks : []).map((t) => {
                    const displayDateISO =
                      t.dueDate || t.startDate ||
                      (Number.isFinite(+t.id) ? new Date(+t.id).toISOString().slice(0,10) : "");
                    const dateFmt = displayDateISO
                      ? new Date(displayDateISO + "T00:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
                      : "";
                    return (
                      <div key={t.id} className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-accent">
                        <div className="h-8 w-8 rounded-full bg-card grid place-items-center text-lg task-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="18" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{t.title}</div>
                          <div className="text-xs text-gray-500">{dateFmt}</div>
                        </div>
                        <input aria-label="Mark task done" type="checkbox" className="h-3 w-4 rounded border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
                      </div>
                    );
                  })}
                </div>

                <button
                  className="w-full mb-3 py-3 rounded-xl bg-accent on-accent font-semibold hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                  onClick={() => navigate(TASKS_ROUTE)}
                >
                  See All
                </button>
              </Card>
            </section>
          </main>
        </div>
      </div>

      {/* Mobile theme toggle (unchanged) */}
      <div className="block lg:hidden fixed bottom-4 left-4 z-50">
        <div className={`theme-switch ${theme === "dark" ? "dark" : ""}`} role="group" aria-label="Theme toggle">
          <button
            type="button"
            className="sun-button"
            aria-pressed={theme === "light"}
            aria-label="Switch to light mode"
            onClick={() => setTheme("light")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setTheme("light"); }}
          >
            <svg viewBox="0 0 18 18" width="18" height="18" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M4.93 4.93l1.41 1.41" />
                <path d="M17.66 17.66l1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="M4.93 19.07l1.41-1.41" />
                <path d="M17.66 6.34l1.41-1.41" />
              </g>
            </svg>
          </button>

          <button type="button" className="knob-button" aria-hidden="true" tabIndex={-1} />

          <button
            type="button"
            className="moon-button"
            aria-pressed={theme === "dark"}
            aria-label="Switch to dark mode"
            onClick={() => setTheme("dark")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setTheme("dark"); }}
          >
            <svg className="moon moon-icon" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}