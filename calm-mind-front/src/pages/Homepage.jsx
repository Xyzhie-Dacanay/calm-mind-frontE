
import React, { useEffect, useState } from 'react';

export default function HomePage() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('cm-theme') || 'light';
    } catch { return 'light'; }
  });

  useEffect(() => {
  try { localStorage.setItem('cm-theme', theme); } catch { /* ignore */ }
    // Add a top-level class for other global CSS if desired
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('cm-dark', theme === 'dark');
    }
  }, [theme]);

  // Toggle between 'light' and 'dark' themes
  const toggleTheme = (forced) => {
    setTheme(prev => {
      const next = typeof forced === 'string' ? forced : (prev === 'dark' ? 'light' : 'dark');
      // debug logging to confirm handler runs
      try { console.info('toggleTheme ->', next); } catch (err) { console.debug(err); }

      // transient toast so user can see the toggle fired even if some styles still override
      try {
        const t = document.createElement('div');
        t.className = 'cm-theme-toast';
        t.textContent = `Theme: ${next}`;
        Object.assign(t.style, { position: 'fixed', top: '16px', right: '16px', zIndex: 9999 });
        document.body.appendChild(t);
        setTimeout(() => { t.classList.add('cm-theme-toast-hide'); }, 900);
        setTimeout(() => { t.remove(); }, 1400);
      } catch (err) { console.debug(err); }

      return next;
    });
  };

  return (
    // Make the page truly occupy the full viewport and remove outer visual gaps
  <div className="min-h-screen h-screen px-4">
      {/* Two-column layout: sidebar + right column (header + content) */}
  <div className="h-full w-full flex py-4">
        {/* Sidebar */}
  {/* Sidebar: keep it visible and remove external margin so layout fills the page */}
  <aside className="hidden lg:flex w-[24rem] shrink-0 flex-col rounded-2xl bg-card border border-gray-200 p-6 gap-4 ml-9 shadow-sm" aria-label="Primary">
          <div className="w-full flex items-center justify-center gap-0 py-3">
            <img src="/logo.png" alt="Calm Mind Logo" className="h-16 w-16" />
            <img src="/calmtxt.svg" alt="Calm Mind" className="h-9 object-contain" />
          </div>
          <nav className="flex-1 text-[15px]" role="navigation">
            <div className="uppercase text-gray-400 text-[11px] px-3 mb-2">Menu</div>
            <ul className="space-y-1">
              {[
                ['Home','home'],
                ['Task Management','tasks'],
                ['Calendar','calendar'],
                ['Chat Bot','chat'],
                ['Analytics','chart'],
              ].map(([item,icon], idx) => (
                <li key={item}>
                  <a className={`relative flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${idx===0?'bg-card text-accent font-semibold':'text-gray-700'}`} aria-current={idx===0? 'page': undefined} href="#">
                    {idx===0 && (<span className="absolute -left-4 top-1/2 -translate-y-1/2 h-6 w-1 rounded bg-accent" />)}
                    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${idx===0? 'text-accent':'text-gray-500'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {icon==='home' && (<>
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </>)}
                      {icon==='tasks' && (<>
                        <rect x="4" y="5" width="16" height="14" rx="2" />
                        <path d="M8 9h8M8 13h5" />
                      </>)}
                      {icon==='calendar' && (<>
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4M8 3v4M3 11h18" />
                      </>)}
                      {icon==='chat' && (<>
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </>)}
                      {icon==='chart' && (<>
                        <path d="M3 21h18" />
                        <rect x="5" y="12" width="3" height="6" rx="1" />
                        <rect x="10" y="9" width="3" height="9" rx="1" />
                        <rect x="15" y="6" width="3" height="12" rx="1" />
                      </>)}
                    </svg>
                    <span className="truncate">{item}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="uppercase text-gray-400 text-[11px] px-3 mt-6 mb-2">General</div>
            <ul className="space-y-1">
              {[
                ['Settings','settings'],
                ['Help','help'],
                ['Sign out','logout'],
              ].map(([item,icon]) => (
                <li key={item}>
                  <a className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {icon==='settings' && (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>)}
                      {icon==='help' && (<><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" /><line x1="12" y1="17" x2="12" y2="17" /></>)}
                      {icon==='logout' && (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>)}
                    </svg>
                    <span className="truncate">{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
              <div className="mt-auto px-2 pb-1">
              <div className="flex items-center gap-3">
              <div className={`theme-switch ${theme === 'dark' ? 'dark' : ''}`} role="group" aria-label="Theme toggle">
                {/* Permanent Sun button (left) — always visible, forces light mode */}
                <button
                  type="button"
                  className="sun-button"
                  aria-pressed={theme === 'light'}
                  aria-label="Switch to light mode"
                  onClick={() => toggleTheme('light')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme('light'); }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

                {/* Indicator knob (slides) — no icon, visual indicator only */}
                <button
                  type="button"
                  className="knob-button"
                  aria-hidden="true"
                  tabIndex={-1}
                />

                {/* Right button — Moon (forces dark mode) */}
                <button
                  type="button"
                  className="moon-button"
                  aria-pressed={theme === 'dark'}
                  aria-label="Switch to dark mode"
                  onClick={() => toggleTheme('dark')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme('dark'); }}
                >
                  <svg className="moon moon-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right column */}
  {/* Right column: ensure it stretches and its content can scroll when needed */}
  <div className="flex-1 flex flex-col min-h-0">
          {/* Right column remains; header moved into main grid below to align box edges with cards */}

          {/* Main content grid */}
          {/* Main content grid: allow vertical scrolling inside the right column, header is now a grid item to align with cards */}
          <main className="flex-1 min-h-0 grid grid-cols-12 gap-6 px-10 pb-6">
            {/* Header (moved into grid so box edges align with cards) */}
            <div className="col-span-12">
              <div className="h-[80px] w-full bg-card border border-gray-200 rounded-2xl shadow-sm px-4 flex items-center justify-between">
                <h1 className="text-3xl font-extrabold tracking-tight">Home</h1>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-gray-200">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                    <input placeholder="Search" className="outline-none text-sm placeholder:text-gray-400 bg-transparent" />
                  </div>
                  <button className="h-10 w-10 grid place-items-center rounded-full bg-card border border-gray-200 shadow-sm">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="19" r="1"/><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14v-3a6 6 0 1 0-12 0v3a2 2 0 0 1-.6 1.4L4 17h5"/></svg>
                  </button>
                  <button className="h-10 w-10 grid place-items-center rounded-full bg-card border border-gray-200 shadow-sm">
                    <span className="text-base">👤</span>
                  </button>
                </div>
              </div>
            </div>
          {/* Left grid (8 cols) */}
          <section className="col-span-12 xl:col-span-8 grid grid-rows-[200px_120px_300px_auto] grid-cols-12 gap-6 h-full">
            {/* Overall Information (span two rows to align with two stacked cards on the right) */}
            <div className="col-span-7 row-span-2 bg-card text-primary rounded-2xl p-6 shadow-sm relative overflow-hidden h-full panel-overall">
              <div className="flex items-start justify-between">
                <h2 className="text-3xl font-semibold tracking-tight text-primary">Overall Information</h2>
                <button aria-label="More options" className="text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">⋮</button>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1">
                <div>
                  <div className="text-6xl font-extrabold text-accent leading-none">24</div>
                  <div className="text-sm text-gray-300 mt-2">Tasks done for all time</div>
                  {/* small decorative pill under the stat - scoped class so we can style it independently */}
                  <div className="mt-6 overall-pill" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-6xl font-extrabold text-accent leading-none">24</div>
                  <div className="text-sm text-gray-300 mt-2">Tasks that are skipped</div>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-5 justify-items-center">
                {[
                  ['Tasks','34','M11 7h8M6 12h14M6 17h14'],
                  ['In Progress','23','M12 6v6l4 2'],
                  ['Completed','13','m5 13 4 4L19 7'],
                ].map(([label,value,iconPath]) => (
                  <div key={label} className="bg-card text-primary rounded-2xl p-4 shadow-md flex flex-col items-center justify-center gap-3 h-26 w-36 md:w-30">
                    <div className="h-10 w-6 rounded-full bg-card grid place-items-center shadow-sm text-accent">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={iconPath} />
                      </svg>
                    </div>
                    <div className="text-4xl md:text-5xl font-extrabold leading-7 text-primary">{value}</div>
                    <div className="text-[12px] uppercase tracking-wide text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>

                        {/* Help card (top-right) */}
                        <div className="col-span-5 bg-card rounded-2xl p-6 border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center text-center panel-help">
                          <h3 className="text-xl font-extrabold">Need Some Help?</h3>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-[18rem]">Let the AI Coach plan your next 25 minutes.</p>
                          <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent on-accent font-semibold shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent" aria-label="Open Coach">
                            Open Coach
                          </button>
                        </div>

            {/* Mood (below help) */}
            <div className="col-span-5 bg-card text-primary rounded-2xl p-6 shadow-sm h-full flex flex-col items-center justify-center text-center panel-mood">
              <div className="text-accent font-black italic text-lg tracking-wide">How are you feeling right now?</div>
              <div className="mt-4 flex items-center gap-3">
                {[...Array(5)].map((_,i)=> (
                  <button key={i} aria-label={`Mood ${i+1}`} className={`h-9 w-9 rounded-full grid place-items-center border border-gray-700 transition-shadow ${i===2? 'bg-accent on-accent':'bg-card text-primary hover:ring-2 hover:ring-accent/60 focus-visible:ring-2 focus-visible:ring-accent'}`}>
                    <span className="text-lg">●</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="pt-3 pr-6 pl-6 col-span-7 bg-card rounded-2xl p-1 border border-gray-200 shadow-sm h-full flex flex-col">
              {/* Month header with nav */}
              <div className="-mt-2 flex items-center justify-between px-2">
                <button aria-label="Prev month" className="mt-3 h-8 w-8 grid place-items-center rounded-full bg-white/60 text-gray-700 hover:bg-card shadow-sm">‹</button>
                <div className="pt-3 font-extrabold text-center text-base">October 2025</div>
                <button aria-label="Next month" className="mt-3 h-8 w-8 grid place-items-center rounded-full bg-white/60 text-gray-700 hover:bg-card shadow-sm">›</button>
              </div>

              {/* Weekday labels */}
              <div className="grid grid-cols-7 text-center text-[12px] font-medium text-gray-600 mb-0 p-3">
                {["S","M","T","W","T","F","S"].map((d,i) => (
                  <div key={`${d}-${i}`} className="py-1 tracking-wider uppercase">{d}</div>
                ))}
              </div>

              {/* Dates grid */}
              <div className="grid grid-cols-7 gap-0 mb-0 text-center text-sm auto-rows-[minmax(36px,1fr)] h-full px-3 pb-3">
                {[
                  ...Array(3).fill(null),
                  ...Array.from({length:31},(_,i)=>i+1),
                  ...Array(1).fill(null)
                ].map((d,idx)=> (
                  <div key={idx} className={`flex items-center justify-center rounded-md transition-colors duration-150 ${d===24 ? 'bg-accent on-accent font-extrabold shadow-md' : 'hover:bg-card text-gray-700'}`}>
                    <span className={`${d===24? 'text-base':'text-sm'}`}>{d ?? ''}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Tracker */}
            <div className="col-span-5 relative bg-card text-primary rounded-2xl p-6 shadow-sm h-full flex flex-col items-center justify-center text-center panel-time">
              <div className="relative w-full">
                <button aria-label="Expand" className="time-action h-8 w-8 rounded-full bg-card grid place-items-center hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">↗</button>
                <h3 className="mb-10 font-semibold">Time Tracker</h3>
              </div>
                <div className="mb-3 text-accent text-6xl font-extrabold tracking-widest leading-none">02 : 24</div>
              <div className="mt-4 flex items-center gap-4 justify-center">
                <button aria-label="Play" className="mb-5 h-16 w-16 rounded-full bg-card text-primary grid place-items-center hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><polygon points="8,5 19,12 8,19"/></svg>
                </button>
                <button aria-label="Pause" className="mb-5 h-16 w-16 rounded-full bg-card text-primary grid place-items-center hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <div className="h-5 w-5 border-l-2 border-r-2 border-muted" />
                </button>
              </div>
            </div>

            {/* Today's Plan */}
            <div className="col-span-12 overflow-hidden">
              <div className="text-lg font-bold mb-3">Today’s Plan</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["Prototype Animation","Milestone 1","Milestone 1"].map((title,i)=> (
                    <div key={i} className={`bg-card text-primary rounded-2xl p-6 h-31 panel-plan`}> 
                    <div className="font-semibold">{title}</div>
                    <p className="text-xs mt-2 text-gray-300">Vivamus sed tortor in ante placerat auctor.</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right sidebar content (4 cols) */}
          <section className="col-span-12 xl:col-span-4 grid grid-rows-[200px_120px_300px_auto] gap-6 h-full">
            {/* Profile + chart (span top two rows to align with left column) */}
              <div className="row-span-2 bg-card rounded-2xl p-9 border border-gray-200 shadow-sm h-full relative">
              {/* Heading aligned to box left */}
                            <div className="avatar-abs h-20 w-20 rounded-full bg-accent overflow-hidden grid place-items-center text-3xl on-accent">👩🏻‍💼</div>
              <div>
                <h2 className="p-2 font-extrabold text-lg tracking-tight">Goodmorning, Dodi!</h2>
                <div className="p-1 ml-1 mb-9 text-sm text-gray-500">Vivamus sed tortor in ante placerat auctor.</div>
              </div>

              {/* Avatar positioned top-right */}

              {/* Simple bar chart */}
              <div className="mt-6 chart-wrap">
                <div className="chart-left">
                  <div className="chart-label">50</div>
                  <div className="chart-label">40</div>
                  <div className="chart-label">30</div>
                  <div className="chart-label">20</div>
                  <div className="chart-label">10</div>
                  <div className="chart-label">0</div>
                  <div className="chart-label">x</div>
                </div>
                <div className="chart-right">
                  <div className="mt-9 grid grid-cols-7 gap-3 items-end h-28">
                    {(() => {
                      const data = [12,20,6,10,8,20,4];
                      const maxValue = 40; // scale to 40 as requested
                      const maxPixels = 112; // reduced to match smaller chart height
                      return data.map((v,i) => {
                        const px = Math.round((v / maxValue) * maxPixels);
                        return (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className="bar w-6">
                              <div className="bar-fill" style={{height: `${px}px`}} />
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Your Tasks (span the lower two rows) */}
            <div className="row-span-2 bg-card rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold tracking-tight">Your Tasks</h3>
                <button aria-label="Add Task" className="h-8 w-8 rounded-full bg-card grid place-items-center hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">＋</button>
              </div>
              <div className="mt-4 space-y-3 flex-1 overflow-hidden">
                {[1,2,3].map((i)=> (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-accent">
                    <div className="h-10 w-10 rounded-full bg-card grid place-items-center text-lg task-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Project Update</div>
                      <div className="text-xs text-gray-500">October {i}, 2025</div>
                    </div>
                    <input aria-label="Mark task done" type="checkbox" className="h-4 w-4 rounded border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full py-3 rounded-xl bg-accent on-accent font-semibold hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent">See All</button>
            </div>
          </section>
          </main>
        </div>
      </div>
        {/* Mobile theme toggle: visible on small screens, hidden on large */}
        <div className="block lg:hidden fixed bottom-4 left-4 z-50">
          <div className={`theme-switch ${theme === 'dark' ? 'dark' : ''}`} role="group" aria-label="Theme toggle">
            {/* Permanent Sun button (left) — always visible on mobile */}
            <button
              type="button"
              className="sun-button"
              aria-pressed={theme === 'light'}
              aria-label="Switch to light mode"
              onClick={() => toggleTheme('light')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme('light'); }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

            {/* Indicator knob (slides) — visual only */}
            <button
              type="button"
              className="knob-button"
              aria-hidden="true"
              tabIndex={-1}
            />

            {/* Right: Moon — always visible on mobile */}
            <button
              type="button"
              className="moon-button"
              aria-pressed={theme === 'dark'}
              aria-label="Switch to dark mode"
              onClick={() => toggleTheme('dark')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme('dark'); }}
            >
              <svg className="moon moon-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            </button>
          </div>
        </div>
    </div>
  );
}