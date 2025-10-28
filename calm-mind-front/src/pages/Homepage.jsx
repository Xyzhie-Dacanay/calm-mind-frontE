import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { ThemeContext } from "../context/ThemeContext";
import Card from "../components/HoverCard";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../store/useProfileStore"; // ✅ import your Zustand profile store

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
const LS_STRESS_B = "cm-stress";
const CHATBOT_ROUTE = "/chatbot";
const TASKS_ROUTE = "/tasks";

const AMBER = "#B9A427";
const GRID = "#e5e7eb";
const TEXT = "#111827";

const toDate = (v) => {
  const d = new Date(v);
  d.setHours(0, 0, 0, 0);
  return d;
};
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

function readTasks() {
  try {
    const a = localStorage.getItem(STORAGE_KEY_TASKS);
    if (a) return JSON.parse(a) || [];
    const b = localStorage.getItem(FALLBACK_TASKS);
    if (b) return JSON.parse(b) || [];
  } catch {}
  return [];
}

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

  /* --------------------- ✅ Zustand Profile Store --------------------- */
  const { profile, fetchProfile, loading, error } = useProfileStore();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?._id || storedUser?.id) {
      fetchProfile(storedUser._id || storedUser.id);
    }
  }, [fetchProfile]);

  /* ---------------------- Tasks + Stress logic ---------------------- */
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
    const id = setInterval(syncTasks, 1000);
    window.addEventListener("storage", syncTasks);
    window.addEventListener("focus", syncTasks);
    return () => {
      window.removeEventListener("storage", syncTasks);
      window.removeEventListener("focus", syncTasks);
      clearInterval(id);
    };
  }, []);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  const startOfTodayTS = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
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

  const counts = useMemo(() => {
    const c = { todo: 0, in_progress: 0, missing: 0, completed: 0, total: 0 };
    tasksLS.forEach((t) => {
      c[deriveStatus(t)]++;
      c.total++;
    });
    return c;
  }, [tasksLS]);

  const topTasks = useMemo(() => {
    const parseTS = (t) => {
      if (t?.dueDate) return new Date(`${t.dueDate}T00:00:00`).getTime();
      const idNum = Number(t?.id);
      return Number.isFinite(idNum) ? idNum : 9e15;
    };
    return [...tasksLS].sort((a, b) => parseTS(a) - parseTS(b)).slice(0, 3);
  }, [tasksLS]);

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
    const id = setInterval(syncStress, 1000);
    window.addEventListener("storage", syncStress);
    window.addEventListener("focus", syncStress);
    return () => {
      window.removeEventListener("storage", syncStress);
      window.removeEventListener("focus", syncStress);
      clearInterval(id);
    };
  }, []);

  const stressSeries7d = useMemo(() => {
    const today = toDate(new Date());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const key = ymd(d);
      return {
        key,
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
      };
    });

    const bucket = new Map(days.map(({ key }) => [key, []]));
    (stressLogs || []).forEach((l) => {
      const ts = l.ts || l.date;
      if (!ts) return;
      const k = ymd(new Date(ts));
      if (bucket.has(k)) bucket.get(k).push(Number(l.stress || 0));
    });

    return days.map(({ key, label }) => {
      const arr = bucket.get(key) || [];
      const avg = arr.length
        ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
        : 0;
      return { label, value: avg };
    });
  }, [stressLogs]);

  const hasStressData = stressSeries7d.some((d) => d.value > 0);

  /* -------------------------------------------------------------------- */
  return (
    <div className="min-h-screen h-screen">
      <div className="h-full w-full flex">
        <Sidebar active="Home" />

        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-3 px-2 pb-2 pt-2 overflow-hidden">
            {/* Header */}
            <div className="col-span-12">
              <Card className="h-20 md:h-[80px] w-full px-4 flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Home
                </h1>
              </Card>
            </div>

            {/* Left grid */}
            <section className="col-span-12 lg:col-span-8 grid grid-rows-[200px_120px_324px_auto] grid-cols-12 gap-3 h-full min-h-0">
              {/* Overall Info */}
              <Card className="col-span-12 md:col-span-6 row-span-2 text-primary p-4 relative overflow-hidden h-full">
                <h2 className="text-xl font-medium">Overall Information</h2>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  <div>
                    <div className="text-6xl font-bold text-accent leading-none">
                      {counts.completed}
                    </div>
                    <div className="text-sm text-gray-300 mt-2">
                      Tasks done for all time
                    </div>
                  </div>
                  <div>
                    <div className="text-6xl font-bold text-accent leading-none">
                      {counts.missing}
                    </div>
                    <div className="text-sm text-gray-300 mt-2">Missing</div>
                  </div>
                </div>
              </Card>

              {/* Help */}
              <Card className="col-span-12 md:col-span-6 p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-extrabold">Need Some Help?</h3>
                <p className="text-m text-gray-600 mt-2">
                  Let the AI Coach plan your next 25 minutes.
                </p>
                <button
                  className="mt-4 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold"
                  onClick={() => navigate(CHATBOT_ROUTE)}
                >
                  Open Coach
                </button>
              </Card>

              {/* Stress Log */}
              <Card className="col-span-12 md:col-span-6 text-primary p-6 flex flex-col items-center justify-center text-center">
                <div className="text-accent font-black italic text-lg tracking-wide">
                  How are you feeling right now?
                </div>
                <button
                  type="button"
                  onClick={() => navigate(CHATBOT_ROUTE)}
                  className="mt-6 px-6 py-3 rounded-xl bg-accent text-white font-semibold"
                >
                  Log stress
                </button>
              </Card>

              {/* Notifications */}
              <Card className="col-span-12 md:col-span-5 row-span-2 text-primary p-4">
                <h2 className="text-xl font-medium tracking-tight">
                  Notifications
                </h2>
                <div className="mt-4 text-sm text-gray-400">
                  No new notifications right now.
                </div>
              </Card>
            </section>

            {/* Right sidebar */}
            <section className="col-span-12 lg:col-span-4 grid grid-rows-[120px_200px_100px_auto] gap-2 h-full">
              {/* ✅ Profile Card (Dynamic) */}
              <Card className="row-span-2 p-8 h-full relative">
                <div className="avatar-abs h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>

                {loading ? (
                  <p className="p-2 text-gray-500">Loading profile...</p>
                ) : error ? (
                  <p className="p-2 text-red-500">Error loading profile</p>
                ) : (
                  <>
                    <h2 className="p-1 font-bold text-m tracking-tight">
                      Goodmorning, {profile.fullName || "Guest"}!
                    </h2>
                    <div className="p-1 ml-1 mb-5 text-sm text-gray-500">
                      {profile.course
                        ? `${profile.course} • ${profile.year}`
                        : ""}
                    </div>
                  </>
                )}

                {/* Stress Trend */}
                <div className="h-40 md:h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stressSeries7d}>
                      <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                      <XAxis dataKey="label" stroke={TEXT} fontSize={12} />
                      <YAxis
                        domain={[0, 5]}
                        tickCount={6}
                        stroke={TEXT}
                        fontSize={12}
                      />
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
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {!hasStressData && (
                  <div className="mt-2 text-xs text-gray-500">
                    No recent stress logs yet.
                  </div>
                )}
              </Card>

              {/* Your Tasks */}
              <Card className="mt-2 row-span-1 p-2 flex flex-col h-fit">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold tracking-tight">Your Tasks</h2>
                  <button
                    onClick={() => navigate(TASKS_ROUTE)}
                    className="h-7 w-7 rounded-full bg-card grid place-items-center"
                  >
                    ＋
                  </button>
                </div>

                <div className="mt-2 space-y-1 flex-1 overflow-hidden">
                  {topTasks.length ? (
                    topTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
                      >
                        <div className="font-semibold">{t.title}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No tasks yet.</p>
                  )}
                </div>

                <button
                  className="w-full mb-3 py-3 rounded-xl bg-accent text-white font-semibold"
                  onClick={() => navigate(TASKS_ROUTE)}
                >
                  See All
                </button>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
