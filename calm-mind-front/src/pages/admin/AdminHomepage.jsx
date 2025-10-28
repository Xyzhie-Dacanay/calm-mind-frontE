// src/pages/admin/AdminHomepage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Card from "../../components/HoverCard";
import PriorityChart from "../../components/analytics/PriorityChart";
import StatusChart from "../../components/analytics/StatusChart";
import StressOverTime from "../../components/analytics/StressOverTime";
import WorkloadVsStress from "../../components/analytics/WorkloadVsStress";
import StressorPie from "../../components/analytics/StressorPie";
import PredictiveTrend from "../../components/analytics/PredictiveTrend";
import FilterCard from "../../components/analytics/FilterCard";
import KpiCards from "../../components/analytics/KpiCards";
import { getTagDistributionFromLogs } from "../../utils/stressUtils";
import {
  buildPeriods,
  toDate,
  fmtYMD,
  addDays,
} from "../../utils/dateHelpers";
import {
  readTasksFromStorage,
  readStressFromStorage,
  deriveStatus,
  taskDateYMD,
  getTaskCounts,
  getPriorityDistribution,
  aggregateStressLogs,
  buildWorkloadVsStress,
} from "../../utils/analyticsData";

/* ------------------------------ palette ----------------------------- */
const COLORS = { gold: "#B9A427", charcoal: "#222322", cardBg: "#1F1F1D" };

export default function AdminHomepage() {
  const location = useLocation();
  const active = location.pathname === "/admin" ? "Dashboard" : undefined;

  /* ---------- theme ---------- */
  const [theme, setTheme] = useState(() => localStorage.getItem("cm-theme") || "light");
  useEffect(() => {
    localStorage.setItem("cm-theme", theme);
    document.documentElement.classList.toggle("cm-dark", theme === "dark");
  }, [theme]);

  /* ---------- live data (localStorage) ---------- */
  // TODO: Replace with aggregated data fetches for all students (e.g., from backend API)
  const [tasks, setTasks] = useState(() => readTasksFromStorage());
  const [stressLogs, setStressLogs] = useState(() => readStressFromStorage());

  const taskLast = useRef(JSON.stringify(tasks));
  const stressLast = useRef(JSON.stringify(stressLogs));

  useEffect(() => {
    const sync = () => {
      // TODO: Fetch aggregated tasks and stress logs for all students
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

  /* ---------- global filters ---------- */
  const today = toDate(new Date());
  const defaultStart = addDays(today, -29);

  const [dateFrom, setDateFrom] = useState(() => localStorage.getItem("an_from") || fmtYMD(defaultStart));
  const [dateTo, setDateTo] = useState(() => localStorage.getItem("an_to") || fmtYMD(today));
  const [periodMode, setPeriodMode] = useState(() => localStorage.getItem("an_mode") || "monthly"); // Default to monthly for admin
  const [groupBy, setGroupBy] = useState("None"); // Included for FilterCard

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
  const totals = useMemo(() => getTaskCounts(tasksForSnapshot, deriveStatus), [tasksForSnapshot]);

  /* ---------- charts data ---------- */
  const priorityPieData = useMemo(
    () => getPriorityDistribution(tasksForSnapshot),
    [tasksForSnapshot]
  );

  const statusBarData = useMemo(() => {
    const base = { "To Do": 0, "In Progress": 0, "Missing": 0, "Completed": 0 };
    tasksForSnapshot.forEach((t) => {
      const s = deriveStatus(t);
      base[s] = (base[s] || 0) + 1;
    });
    return Object.entries(base).map(([name, value]) => ({ name, value }));
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

  const tagsForPie = useMemo(
    () => getTagDistributionFromLogs(stressInRange),
    [stressInRange]
  );

  /* ------------------------------ UI ------------------------------- */
  return (
    <div className="min-h-screen h-screen">
      <div className="h-full w-full flex">
        <AdminSidebar active={active} />
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-transparent">
            <div className="mb-3 mt-2 px-2">
              <Card className="w-full px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:shadow-none hover:-translate-y-0 hover:bg-inherit cursor-default">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard (All Students)</h1>
                </div>
                <div className="text-xs text-gray-500 md:ml-4">
                  Tips: Adjust the date range and period to see trends update live.
                </div>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <div className="px-2 mb-4">
            <FilterCard
              dateFrom={dateFrom}
              onChangeFrom={setDateFrom}
              dateTo={dateTo}
              onChangeTo={setDateTo}
              periodMode={periodMode}
              onChangeMode={setPeriodMode}
              groupBy={groupBy}
              onChangeGroupBy={setGroupBy}
            />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-2 pb-24">
            {/* KPI Cards */}
            <KpiCards totals={totals} colors={COLORS} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriorityChart data={priorityPieData} />
              <StatusChart data={statusBarData} />
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