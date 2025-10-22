// src/pages/Analytics.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Card from "../components/HoverCard";

import PriorityChart from "../components/analytics/PriorityChart";
import StatusChart from "../components/analytics/StatusChart";
import StressOverTime from "../components/analytics/StressOverTime";
import WorkloadVsStress from "../components/analytics/WorkloadVsStress";
import StressorPie from "../components/analytics/StressorPie";
import PredictiveTrend from "../components/analytics/PredictiveTrend";
import { getTagDistributionFromLogs } from "../utils/stressUtils";

import {
  buildPeriods,
  toDate,
  fmtYMD,
  addDays,
} from "../utils/dateHelpers";

import {
  readTasksFromStorage,
  readStressFromStorage,
  deriveStatus,
  taskDateYMD,
  getTaskCounts,
  getPriorityDistribution,
  aggregateStressLogs,
  buildWorkloadVsStress,
} from "../utils/analyticsData";

/* ------------------------------ palette ----------------------------- */
const COLORS = { gold: "#B9A427", charcoal: "#222322", cardBg: "#1F1F1D" };

export default function Analytics() {
  /* ---------- theme ---------- */
  const [theme, setTheme] = useState(() => localStorage.getItem("cm-theme") || "light");
  useEffect(() => {
    localStorage.setItem("cm-theme", theme);
    document.documentElement.classList.toggle("cm-dark", theme === "dark");
  }, [theme]);
  const toggleTheme = (forced) =>
    setTheme((prev) => (typeof forced === "string" ? forced : prev === "dark" ? "light" : "dark"));

  /* ---------- live data (localStorage) ---------- */
  const [tasks, setTasks] = useState(() => readTasksFromStorage());
  const [stressLogs, setStressLogs] = useState(() => readStressFromStorage());

  const taskLast = useRef(JSON.stringify(tasks));
  const stressLast = useRef(JSON.stringify(stressLogs));

  useEffect(() => {
    const sync = () => {
      const t = readTasksFromStorage();
      if (JSON.stringify(t) !== taskLast.current) {
        taskLast.current = JSON.stringify(t);
        setTasks(t);
      }
      const s = readStressFromStorage();
      if (JSON.stringify(s) !== stressLast.current) {
        stressLast.current = JSON.stringify(s);
        setStressLogs(s);
      }
    };
    const onStorage = (e) => {
      if (!e.key) return;
      if (["tasks", "cm-tasks", "cm-stress", "cm_stress_logs_v1"].includes(e.key)) sync();
    };
    const id = setInterval(sync, 1000);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
      clearInterval(id);
    };
  }, []);

  /* ---------- global filters in header ---------- */
  const today = toDate(new Date());
  const defaultStart = addDays(today, -29);

  const [dateFrom, setDateFrom] = useState(() => localStorage.getItem("an_from") || fmtYMD(defaultStart));
  const [dateTo, setDateTo] = useState(() => localStorage.getItem("an_to") || fmtYMD(today));
  const [periodMode, setPeriodMode] = useState(() => localStorage.getItem("an_mode") || "daily"); // daily|weekly|monthly|yearly

  useEffect(() => localStorage.setItem("an_from", dateFrom), [dateFrom]);
  useEffect(() => localStorage.setItem("an_to", dateTo), [dateTo]);
  useEffect(() => localStorage.setItem("an_mode", periodMode), [periodMode]);

  const range = useMemo(() => {
    let s = toDate(dateFrom);
    let e = toDate(dateTo);
    if (e < s) [s, e] = [e, s];
    return { start: s, end: e };
  }, [dateFrom, dateTo]);

  const periods = useMemo(
    () => buildPeriods(range.start, range.end, periodMode),
    [range, periodMode]
  );

  /* ---------- data slices ---------- */
  const tasksForSnapshot = useMemo(() => {
    const { start, end } = range;
    return tasks.filter((t) => {
      const ymd = taskDateYMD(t);
      if (!ymd) return true; // include undated in snapshot
      const d = toDate(ymd);
      return d >= start && d <= end;
    });
  }, [tasks, range]);

  const tasksForTimeSeries = useMemo(() => {
    const { start, end } = range;
    return tasks.filter((t) => {
      const ymd = taskDateYMD(t);
      if (!ymd) return false;
      const d = toDate(ymd);
      return d >= start && d <= end;
    });
  }, [tasks, range]);

  const stressInRange = useMemo(() => {
    const { start, end } = range;
    return stressLogs.filter((s) => {
      const d = toDate(s.ts || s.date);
      return d >= start && d <= end;
    });
  }, [stressLogs, range]);

  /* ---------- KPIs ---------- */
  const totals = useMemo(() => getTaskCounts(tasks, deriveStatus), [tasks]);

  /* ---------- charts data ---------- */
  const priorityPieData = useMemo(
    () => getPriorityDistribution(tasksForSnapshot),
    [tasksForSnapshot]
  );

  const statusBarData = useMemo(() => {
    const base = { "To Do": 0, "In Progress": 0, "Missing": 0, "Completed": 0 };
    tasksForSnapshot.forEach((t) => {
      const s = deriveStatus(t);
      if (s === "todo") base["To Do"]++;
      else if (s === "in_progress") base["In Progress"]++;
      else if (s === "missing") base["Missing"]++;
      else if (s === "completed") base["Completed"]++;
    });
    return [
      { name: "To Do", value: base["To Do"] },
      { name: "In Progress", value: base["In Progress"] },
      { name: "Missing", value: base["Missing"] },
      { name: "Completed", value: base["Completed"] },
    ];
  }, [tasksForSnapshot]);

  const stressSeriesByMode = useMemo(
    () => aggregateStressLogs(stressInRange, periods),
    [stressInRange, periods]
  );

  const workloadVsStress = useMemo(
    () => buildWorkloadVsStress(
      tasksForTimeSeries,
      stressSeriesByMode,
      periods,
      deriveStatus,
      taskDateYMD
    ),
    [tasksForTimeSeries, stressSeriesByMode, periods]
  );

  // ✅ include ALL tags (default + custom) via shared helper
  const tagsForPie = useMemo(
    () => getTagDistributionFromLogs(stressInRange),
    [stressInRange]
  );

  /* ------------------------------ UI ------------------------------- */
  return (
    <div className="min-h-screen h-screen">
      <div className="h-full w-full flex">
        <Sidebar theme={theme} onToggleTheme={toggleTheme} active="Analytics" />
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header (with filters inside) */}
          <div className="sticky top-0 z-20 bg-transparent">
            <div className="mb-3 mt-2 px-2">
              <Card className="w-full px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:shadow-none hover:-translate-y-0 hover:bg-inherit cursor-default">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                </div>

                {/* Filters moved here */}
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex flex-col">
                    <label className="text-[11px] text-gray-500 mb-0.5">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="border rounded-lg px-3 py-2 bg-white/70 dark:bg-neutral-900"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] text-gray-500 mb-0.5">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="border rounded-lg px-3 py-2 bg-white/70 dark:bg-neutral-900"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] text-gray-500 mb-0.5">Period</label>
                    <select
                      value={periodMode}
                      onChange={(e) => setPeriodMode(e.target.value)}
                      className="border rounded-lg px-3 py-2 bg-white/70 dark:bg-neutral-900"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                {/* Tips text */}
                <div className="text-xs text-gray-500 md:ml-4">
                  Tips: Adjust the date range and period to see trends update live.
                </div>
              </Card>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-2 pb-24">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[
                { label: "To Do", value: totals.todo },
                { label: "In Progress", value: totals.in_progress },
                { label: "Missing", value: totals.missing },
                { label: "Completed", value: totals.completed },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl p-6 shadow-sm" style={{ background: COLORS.cardBg, color: "#FFFFFF" }}>
                  <div className="text-sm text-gray-300">{m.label}</div>
                  <div className="text-4xl font-extrabold mt-2" style={{ color: COLORS.gold }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriorityChart data={priorityPieData} />
              <StatusChart data={statusBarData} />

              {/* These charts rely on the global Period/From/To */}
              <StressOverTime periods={periods} series={stressSeriesByMode} />
              <WorkloadVsStress data={workloadVsStress} />

              <StressorPie data={tagsForPie} />
              <PredictiveTrend
                tasks={tasksForTimeSeries}
                stressSeries={stressSeriesByMode}
                periods={periods}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
