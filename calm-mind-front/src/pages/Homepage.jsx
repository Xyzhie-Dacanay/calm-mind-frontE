// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";           // adjust path if needed
import Card from "../components/HoverCard";
import MiniBarChart from "../components/MiniBarChart"; // Recharts wrapper
import MiniCalendar from "../components/MiniCalendar"; // Mantine wrapper
import dayjs from "dayjs";

export default function HomePage() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("cm-theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cm-theme", theme);
    } catch { /* ignore */ }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("cm-dark", theme === "dark");
      // keep Mantine in sync with your theme toggle
      document.documentElement.setAttribute(
        "data-mantine-color-scheme",
        theme === "dark" ? "dark" : "light"
      );
    }
  }, [theme]);

  const toggleTheme = (forced) => {
    setTheme((prev) => {
      const next =
        typeof forced === "string" ? forced : prev === "dark" ? "light" : "dark";
      try {
        const t = document.createElement("div");
        t.className = "cm-theme-toast";
        t.textContent = `Theme: ${next}`;
        Object.assign(t.style, {
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 9999,
        });
        document.body.appendChild(t);
        setTimeout(() => {
          t.classList.add("cm-theme-toast-hide");
        }, 900);
        setTimeout(() => {
          t.remove();
        }, 1400);
      } catch { }
      return next;
    });
  };

  // ---------- Weekly chart data ----------
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(true);

  const weeklyPlaceholder = [
    { name: "Mon", pv: 12, uv: 8 },
    { name: "Tue", pv: 20, uv: 14 },
    { name: "Wed", pv: 6, uv: 9 },
    { name: "Thu", pv: 10, uv: 7 },
    { name: "Fri", pv: 8, uv: 5 },
    { name: "Sat", pv: 20, uv: 13 },
    { name: "Sun", pv: 4, uv: 6 },
  ];

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/stats/weekly-activity", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load weekly activity");
        const json = await res.json();
        const incoming = Array.isArray(json?.data) ? json.data : [];
        if (isMounted) setWeeklyData(incoming.length ? incoming : weeklyPlaceholder);
      } catch {
        if (isMounted) setWeeklyData(weeklyPlaceholder);
      } finally {
        if (isMounted) setWeeklyLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);


  // ---------- Static calendar indicators ----------
  // Example: mark the 16th of the current month with a dot.
  const markedDates = [new Date(dayjs().year(), dayjs().month(), 16)];
  // -----------------------------------------------

  return (
    <div className="min-h-screen h-screen">
      <div className="h-full w-full flex">
        {/* Sidebar */}
        <Sidebar theme={theme} onToggleTheme={toggleTheme} active="Home" />

        {/* Main column */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 min-h-0 grid grid-cols-2 gap-3 px-2 pb-2 pt-2 overflow-hidden">

            {/* Header */}
            <div className="col-span-12">
              <Card className="h-[80px] w-full px-4 flex items-center justify-between hover:shadow-none hover:-translate-y-0 hover:bg-inherit cursor-default">
                <h1 className="text-3xl font-bold tracking-tight">Home</h1>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-gray-200">
                    <svg
                      className="h-4 w-4 text -gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                      placeholder="Search"
                      className="outline-none text-sm placeholder:text-gray-400 bg-transparent"
                    />
                  </div>
                  <button className="h-10 w-10 grid place-items-center rounded-full bg-card border border-gray-200 shadow-sm">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
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

            {/* Left grid */}
            <section className="col-span-2 xl:col-span-8 grid grid-rows-[200px_120px_324px_auto] grid-cols-12 gap-3 h-full">

              {/* Overall Information */}
              <Card className="col-span-6 row-span-2 text-primary p-4 relative overflow-hidden h-full panel-overall">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-medium tracking-tight text-primary">
                    Overall Information
                  </h2>
                  <button
                    aria-label="More options"
                    className="text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                  >
                    ⋮
                  </button>
                </div>

                <div className="mt-1 grid grid-cols-2 gap-1">
                  <div>
                    <div className="text-6xl font-bold text-accent leading-none">24</div>
                    <div className="text-sm text-gray-300 mt-2">Tasks done for all time</div>
                    <div className="mt-10 overall-pill" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-6xl font-bold text-accent leading-none">24</div>
                    <div className="text-sm text-gray-300 mt-2">Tasks that are skipped</div>
                  </div>
                </div>

                {/* Mini-stat cards */}
                <div className="mt-8 grid grid-cols-3 gap-5 justify-items-center">
                  {[
                    ["Tasks", "34", "M11 7h8M6 12h14M6 17h14"],
                    ["In Progress", "23", "M12 6v6l4 2"],
                    ["Completed", "13", "m5 13 4 4L19 7"],
                  ].map(([label, value, iconPath]) => (
                    <Card
                      key={label}
                      className="text-primary p-4 flex flex-col items-center justify-center gap-3 h-32 w-36 md:w-28"
                    >
                      <div className="h-10 w-6 rounded-full bg-card grid place-items-center shadow-sm text-accent">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-accent"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={iconPath} />
                        </svg>
                      </div>
                      <div className="text-4xl md:text-5xl font-extrabold leading-7 text-primary">
                        {value}
                      </div>
                      <div className="text-[12px] uppercase tracking-wide text-gray-500">
                        {label}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Help card */}
              <Card className="col-span-6 p-6 h-full flex flex-col items-center justify-center text-center panel-help">
                <h3 className="text-xl font-extrabold">Need Some Help?</h3>
                <p className="text-m text-gray-600 mt-2 leading-relaxed max-w-[32rem]">
                  Let the AI Coach plan your next 25 minutes.
                </p>
                <button
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent on-accent font-semibold shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                  aria-label="Open Coach"
                >
                  Open Coach
                </button>
              </Card>

              {/* Mood */}
              <Card className="col-span-6 text-primary p-6 h-full flex flex-col items-center justify-center text-center panel-mood">
                <div className="text-accent font-black italic text-lg tracking-wide">
                  How are you feeling right now?
                </div>
                <div className="mt-4 mb-2 flex items-center gap-3">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Mood ${i + 1}`}
                      className={`h-14 w-14 rounded-full grid place-items-center border border-gray-700 transition-shadow ${i === 2
                          ? "bg-accent on-accent"
                          : "bg-card text-primary hover:ring-2 hover:ring-accent/60 focus-visible:ring-2 focus-visible:ring-accent"
                        }`}
                    >
                      <span className="text-lg">●</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Time Tracker (moved left, wider) */}
              <Card className="col-span-7 relative text-primary p-6 h-full flex flex-col items-center justify-center text-center panel-time">
                <div className="relative w-full">
                  <button
                    aria-label="Expand"
                    className="time-action h-8 w-8 rounded-full bg-card grid place-items-center hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    ↗
                  </button>
                  <h3 className="mb-10 font-semibold">Time Tracker</h3>
                </div>
                <div className="mb-3 text-accent text-6xl font-extrabold tracking-widest leading-none">
                  02 : 24
                </div>
                <div className="mt-4 flex items-center gap-4 justify-center">
                  <button
                    aria-label="Play"
                    className="mb-5 h-16 w-16 rounded-full bg-card text-primary grid place-items-center hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                      <polygon points="8,5 19,12 8,19" />
                    </svg>
                  </button>
                  <button
                    aria-label="Pause"
                    className="mb-5 h-16 w-16 rounded-full bg-card text-primary grid place-items-center hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <div className="h-5 w-5 border-l-2 border-r-2 border-muted" />
                  </button>
                </div>
              </Card>

              {/* Calendar (moved right, narrower) */}
              <Card className="col-span-5 p-1 h-full w-full flex flex-col">
                <div className="flex items-center justify-center mb-4">
           
                </div>

                {/* Center the calendar, prevent overflow */}
                <div className="flex-1 flex items-center justify-center min-w-0">
                  <div className="cm-mini-cal-wrapper min-w-0 max-w-full overflow-hidden text-sm">
                    <MiniCalendar
                      staticMode
                      indicators={markedDates}
                      indicatorColor="red"
                      size="sm"
                    />
                  </div>
                </div>
              </Card>

            </section>

            {/* Right sidebar */}
            <section className="col-span-6 xl:col-span-4 grid grid-rows-[120px_210px_100px_auto] gap-2 h-full">
              {/* Profile + chart */}
              <Card className="row-span-2 pl-18 pr-18 pt-8 pb-2 h-full">
                <div className="flex flex-col items-center">
                  <div className="h-18 w-18 rounded-full bg-accent overflow-hidden grid place-items-center text-1xl on-accent mb-2">
                    👩🏻‍💼
                  </div>
                  <h3 className="font-extrabold text-lg">Goodmorning, Dodi!</h3>
                  <div className="text-xs text-gray-500 mt-1">
                    Vivamus sed tortor in ante placerat auctor.
                  </div>
                </div>

                <div className="mt-4">
                  <MiniBarChart
                    data={weeklyData}
                    keys={["pv", "uv"]}
                    stacked={true}
                    colors={["#0F0F0D", "#B9A427"]}
                    height={160}
                    loading={weeklyLoading}
                    emptyText="No weekly activity yet"
                    categoryGap="5%"
                    barGap={4}
                    barSize={10}
                    flush
                  />
                </div>
              </Card>

              {/* Your Tasks */}
              <Card className="row-span-1 p-1   flex flex-col h-fit">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold tracking-tight">Your Tasks</h2>
                  <button
                    aria-label="Add Task"
                    className="h-7 w-7 rounded-full bg-card grid place-items-center hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="font-black">＋</span>
                  </button>
                </div>
                <div className="mt-2 space-y-1 flex-1 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-accent"
                    >
                      <div
                        className="h-8 w-8 rounded-full bg-card grid place-items-center text-lg task-icon"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">Project Update</div>
                        <div className="text-xs text-gray-500">October {i}, 2025</div>
                      </div>
                      <input
                        aria-label="Mark task done"
                        type="checkbox"
                        className="h-3 w-4 rounded border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      />
                    </div>
                  ))}
                </div>
                <button className="w-full mb-3 py-3 rounded-xl bg-accent on-accent font-semibold hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent">
                  See All
                </button>
              </Card>
            </section>
          </main>
        </div>
      </div>

      {/* Mobile theme toggle */}
      <div className="block lg:hidden fixed bottom-4 left-4 z-50">
        <div
          className={`theme-switch ${theme === "dark" ? "dark" : ""}`}
          role="group"
          aria-label="Theme toggle"
        >
          <button
            type="button"
            className="sun-button"
            aria-pressed={theme === "light"}
            aria-label="Switch to light mode"
            onClick={() => toggleTheme("light")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleTheme("light");
            }}
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
            onClick={() => toggleTheme("dark")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleTheme("dark");
            }}
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
