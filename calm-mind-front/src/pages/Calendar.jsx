import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import { ThemeContext } from '../context/ThemeContext';
import Card from "../components/HoverCard";

export default function Calendar() {
  const { theme, setTheme } = useContext(ThemeContext);

  // navigate removed because right-column actions were removed



  const monthName = 'October 2025';

  // Static grid: 2 leading empty cells, 1..31, and one trailing empty cell to match screenshot padding
  const daysGrid = [
    ...Array(2).fill(null),
    ...Array.from({ length: 31 }, (_, i) => i + 1),
    ...Array(1).fill(null),
  ];

  // Sample event markers similar to the screenshot
  const examplePoints = {
    3: [ { color: 'bg-pink-500', text: 'Tasks here' } ],
    8: [ { color: 'bg-orange-400', text: 'Tasks here' } ],
    17: [ { color: 'bg-pink-500', text: 'Tasks here' } ],
    22: [ { color: 'bg-orange-400', text: 'Tasks' } ],
    24: [ { color: 'bg-green-400', text: 'Tasks' }, { color: 'bg-red-400', text: 'Tasks' }, { color: 'bg-yellow-400', text: 'Tasks' } ]
  };

  return (
    <div className="min-h-screen h-screen">
      <div className="h-screen w-full flex">
        <Sidebar />

        <div className="flex-1 flex flex-col min-h-0">
          {/* Sticky Header */}
          <div className="sticky top-0 z-20 bg-transparent">
            <div className="mb-3 mt-2 px-2">
              <Card className="h-[80px] w-full px-4 flex items-center justify-between hover:shadow-none hover:-translate-y-0 hover:bg-inherit cursor-default">
                <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-gray-200">
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
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 pt-2">

            {/* Top calendar */}
            <div className="col-span-12 grid grid-rows-[auto_1fr] grid-cols-12 gap-3 h-full">

              <Card className="pt-3 pr-6 pl-6 col-span-12 p-1 h-full flex flex-col border-4 border-[#63a8ff] shadow-[0_0_0_6px_rgba(99,168,255,0.08)] overflow-hidden">
                <div className="-mt-2 flex items-center justify-between px-2">
                  <div className="pt-3 font-extrabold text-center text-xl">{monthName}</div>
                  <div className="flex items-center gap-3">
                    <button className="h-8 w-8 grid place-items-center rounded-full bg-white/60 text-gray-700 hover:bg-card shadow-sm">＋</button>
                    <div className="flex items-center gap-2 bg-card rounded-full p-1">
                      <button className="px-3 py-1 rounded-full bg-card">Day</button>
                      <button className="px-3 py-1 rounded-full bg-card">Week</button>
                      <button className="px-3 py-1 rounded-full bg-accent on-accent">Month</button>
                    </div>
                  </div>
                </div>
                <div className="rounded-md bg-white shadow-sm p-4 mt-3 flex justify-center">
                  <div className="overflow-hidden rounded-md w-full max-w-[1100px]">
                    <div className="grid grid-cols-7 text-center text-[12px] font-medium mb-0 p-0">
                    {['MON','TUE','WED','THU','FRI','SAT','SUN'].map((d) => (
                      <div key={d} className="py-2 tracking-wider uppercase font-semibold text-sm bg-black text-white/90 border-b border-transparent">{d}</div>
                    ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0 mb-0 text-center text-sm auto-rows-[minmax(60px,1fr)] h-[520px] px-0 pb-0">
                      {daysGrid.map((d, idx) => (
                        <div key={idx} className={`flex flex-col items-start justify-start p-3 border border-transparent ${d === 24 ? 'bg-accent on-accent font-extrabold' : 'bg-[#efe6c9] text-gray-700'}`}>
                          <div className="text-sm text-gray-600">{d ?? ''}</div>
                          <div className="mt-3 text-left space-y-1">
                            {d && examplePoints[d] && examplePoints[d].map((p, pi) => (
                              <div key={pi} className="flex items-center gap-2 text-xs">
                                <span className={`${p.color} h-3 w-3 rounded-full inline-block`} />
                                <span className="text-xs text-gray-700">{p.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </Card>

            </div>

          </div>

        </div>
      </div>

      {/* Mobile theme toggle */}
      <div className="block lg:hidden fixed bottom-4 left-4 z-50">
        <div className={`theme-switch ${theme === "dark" ? "dark" : ""}`} role="group" aria-label="Theme toggle">
          <button type="button" className="sun-button" aria-pressed={theme === "light"} aria-label="Switch to light mode" onClick={() => setTheme("light")}>☀️</button>
          <button type="button" className="knob-button" aria-hidden="true" tabIndex={-1} />
          <button type="button" className="moon-button" aria-pressed={theme === "dark"} aria-label="Switch to dark mode" onClick={() => setTheme("dark")}>🌙</button>
        </div>
      </div>
    </div>
  );
}
