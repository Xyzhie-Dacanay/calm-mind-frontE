import React, { useEffect, useMemo, useState } from "react";
import { Plus, MoreVertical, Kanban, List, Table, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TaskBoard from "../components/TaskBoard";
import TaskListView from "../components/TaskListView";
import TaskTableView from "../components/TaskTableView";
import TaskForm from "../components/TaskForm";
import TaskOverview from "../components/TaskOverview";
import KebabMenu from "../components/KebabMenu";
import Card from "../components/HoverCard";
import dayjs from "dayjs";

const STORAGE_KEY = "tasks";

const AMBER = { 500: "#f59e0b", 600: "#d97706" };

function toDateKey(ts) {
  return dayjs(ts).format("YYYY-MM-DD");
}

export default function TaskManagement() {
  // Theme
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
    } catch { }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("cm-dark", theme === "dark");
    }
  }, [theme]);
  const toggleTheme = (forced) => {
    setTheme((prev) => (typeof forced === "string" ? forced : prev === "dark" ? "light" : "dark"));
  };

  // View
  const [view, setView] = useState("board");

  // Tick for “Missing” status updates
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Tasks
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch { }
  }, [tasks]);

  // Date helpers & derived status
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
    if (!task) return "todo";
    if (task.status === "completed" || task.status === "done_late") return task.status;
    if (isPast(task.dueDate)) return "missing";
    return task.status;
  };

  const tasksByStatus = useMemo(() => {
    const map = { todo: [], in_progress: [], missing: [], completed: [] };
    tasks.forEach((t) => {
      const status = deriveStatus(t);
      map[status === "done_late" ? "completed" : status].push(t);
    });
    return map;
  }, [tasks]);

  // Stress calculation for individual tasks
  const getTaskStress = (task) => {
    const status = deriveStatus(task);
    if (status === "completed" || status === "done_late") return 0;
    if (status === "missing") return 100;
    if (!task.dueDate) return 0;

    const dueTS = new Date(`${task.dueDate}T23:59:59`).getTime();
    const daysToDue = (dueTS - now) / 86400000;
    if (daysToDue < 0) return 100;

    const maxDays = 7;
    const stress = Math.max(0, 100 - (daysToDue / maxDays) * 100);
    return Math.floor(stress);
  };

  // Memoized task stresses (used by board/list/table UIs)
  const taskStresses = useMemo(() => {
    return tasks.reduce((map, t) => {
      map[t.id] = getTaskStress(t);
      return map;
    }, {});
  }, [tasks, now]);

  // Overall stress
  const { overallStress, stressLevel, mainContributors, activeTasks } = useMemo(() => {
    const activeTasks = tasks.filter((t) => {
      const s = deriveStatus(t);
      return s !== "completed" && s !== "done_late";
    });

    if (activeTasks.length === 0) {
      return { overallStress: 0, stressLevel: "Low", mainContributors: [], activeTasks: [] };
    }

    const stresses = activeTasks.map((t) => getTaskStress(t));
    const avgStress = stresses.reduce((a, b) => a + b, 0) / activeTasks.length;

    const numInProgress = tasksByStatus.in_progress.length;
    const numMissing = tasksByStatus.missing.length;
    const adjustedStress = Math.min(100, avgStress + numInProgress * 5 + numMissing * 10);

    const level = adjustedStress < 33 ? "Low" : adjustedStress < 66 ? "Moderate" : "High";

    const sorted = [...activeTasks].sort((a, b) => getTaskStress(b) - getTaskStress(a));
    const contrib = sorted
      .slice(0, 2)
      .flatMap((t) => t.tags && t.tags.length > 0 ? t.tags : ["(no tags)"])
      .join(", ");

    return { overallStress: Math.floor(adjustedStress), stressLevel: level, mainContributors: contrib, activeTasks: sorted };
  }, [tasks, tasksByStatus, now]);

  const recommendations = useMemo(() => {
    if (stressLevel === "Low") {
      return [
        "No stress detected. Enjoy your day!",
        "Consider planning ahead for upcoming tasks.",
        "Relax and recharge for future challenges.",
      ];
    } else if (stressLevel === "Moderate") {
      return [
        "Take short breaks: Try the Pomodoro technique—25 minutes focus, 5 minutes rest.",
        "Practice deep breathing exercises to center yourself.",
        "Prioritize tasks to avoid feeling overwhelmed.",
      ];
    } else {
      return [
        "Prioritize self-care: Go for a short walk or meditate for 10 minutes.",
        "Break tasks into smaller, manageable steps.",
        "Reach out for support if needed—talk to a friend or mentor.",
      ];
    }
  }, [stressLevel]);

  // Sidebar toggle
  const [showSidebar, setShowSidebar] = useState(true);

  // Add/Edit Form state
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    status: "todo",
    priority: "Medium",
    startDate: "",
    dueDate: "",
    description: "",
    tags: [],
  });

  const resetForm = () => {
    setEditingTaskId(null);
    setFormError("");
    setFormData({
      title: "",
      status: "todo",
      priority: "Medium",
      startDate: "",
      dueDate: "",
      description: "",
      tags: [],
    });
  };

  const validate = (data = formData) => {
    const errs = [];
    if (!data.title?.trim()) errs.push("Title is required.");
    if (!data.dueDate) errs.push("Due date is required.");
    if (data.startDate && data.dueDate && data.startDate > data.dueDate) {
      errs.push("Due date must be on/after start date.");
    }
    setFormError(errs.join(" "));
    return errs.length === 0;
  };

  const addTask = () => {
    if (!validate()) return;
    const newTask = {
      id: crypto?.randomUUID?.() ?? Date.now().toString(),
      title: formData.title.trim(),
      status: formData.status === "missing" ? "todo" : formData.status,
      priority: formData.priority,
      startDate: formData.startDate || "",
      dueDate: formData.dueDate || "",
      description: formData.description || "",
      tags: formData.tags || [],
    };
    setTasks((prev) => [...prev, newTask]);
    setShowForm(false);
    resetForm();
  };

  const startEdit = (task) => {
    if (!task) return;
    setEditingTaskId(task.id);
    setFormError("");
    setFormData({
      title: task.title,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate,
      dueDate: task.dueDate,
      description: task.description,
      tags: task.tags || [],
    });
    setShowForm(true);
  };

  const saveEdit = () => {
    if (!validate()) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTaskId
          ? {
            ...t,
            title: formData.title.trim(),
            status:
              formData.status === "missing" || formData.status === "done_late"
                ? t.status
                : formData.status,
            priority: formData.priority,
            startDate: formData.startDate || "",
            dueDate: formData.dueDate || "",
            description: formData.description || "",
            tags: formData.tags || [],
          }
          : t
      )
    );
    setShowForm(false);
    resetForm();
  };

  // Status transitions
  const updateTaskStatus = (taskId, newStatus) => {
    if (newStatus === "missing" || newStatus === "done_late") return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (newStatus === "completed" && isPast(t.dueDate)) {
            return { ...t, status: "done_late" };
          }
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const completeTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, status: isPast(t.dueDate) ? "done_late" : "completed" };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const deleteAll = () => {
    if (!window.confirm("Delete ALL tasks? This cannot be undone.")) return;
    setTasks([]);
  };

  // Overview drawer
  const [viewTaskId, setViewTaskId] = useState(null);
  const openOverview = (task) => {
    if (task?.id) setViewTaskId(task.id);
  };
  const closeOverview = () => setViewTaskId(null);
  const viewingTask = useMemo(() => tasks.find((t) => t.id === viewTaskId) || null, [tasks, viewTaskId]);

  // Columns
  const columns = [
    { title: "To Do", status: "todo" },
    { title: "In Progress", status: "in_progress" },
    { title: "Missing", status: "missing" },
    { title: "Completed", status: "completed" },
  ];

  /* ---------- Modal helpers ---------- */
  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!showForm) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showForm]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && showForm) closeForm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showForm]);

  return (
    <div className="min-h-screen h-screen flex">
      <Sidebar theme={theme} onToggleTheme={toggleTheme} />
      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 overflow-hidden">
          <div className="mx-auto max-w-7xl h-full flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0">
              <Card className="h-20 md:h-[80px] w-full px-2 flex items-center justify-between hover:shadow-none hover:-translate-y-0 hover:bg-inherit cursor-default">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Task Management</h1>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 rounded-full border border-gray-200 bg-white px-1 py-1 shadow-sm">
                    {[
                      { key: "board", label: "Board", Icon: Kanban },
                      { key: "list", label: "List", Icon: List },
                      { key: "table", label: "Table", Icon: Table },
                    ].map((v) => (
                      <button
                        key={v.key}
                        onClick={() => setView(v.key)}
                        className={`flex items-center px-3 py-1 text-sm font-medium rounded-full transition ${view === v.key ? "bg-[#b7a42f] text-white" : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <v.Icon size={16} className="mr-1.5" />
                        {v.label}
                      </button>
                    ))}
                  </div>

                  <select
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#b7a42f] focus:ring-[#b7a42f] sm:hidden"
                    value={view}
                    onChange={(e) => setView(e.target.value)}
                  >
                    <option value="board">Board</option>
                    <option value="list">List</option>
                    <option value="table">Table</option>
                  </select>

                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 transition"
                    aria-label="Add Task"
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add Task</span>
                  </button>

                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 transition"
                  >
                    {showSidebar ? "Hide" : "Show"} Summary
                  </button>

                  <KebabMenu
                    triggerClass="rounded-md border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50 transition"
                    triggerIcon={<MoreVertical size={16} className="text-gray-600" />}
                    items={[{ key: "delete-all", label: "Delete All Tasks", danger: true, onClick: deleteAll }]}
                  />
                </div>
              </Card>
            </div>

            {/* Main content */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 p-2 md:p-3 lg:p-2">
              <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-y-auto">
                {view === "board" && (
                  <TaskBoard
                    columns={columns}
                    tasksByStatus={tasksByStatus}
                    onCardClick={openOverview}
                    onEdit={startEdit}
                    onDelete={deleteTask}
                    onStatusChange={updateTaskStatus}
                    completeTask={completeTask}
                    deriveStatus={deriveStatus}
                    taskStresses={taskStresses}
                    onAddTask={(status) => {
                      resetForm();
                      setFormData({
                        title: "",
                        status: status === "missing" ? "todo" : status,
                        priority: "Medium",
                        startDate: "",
                        dueDate: "",
                        description: "",
                        tags: [],
                      });
                      setShowForm(true);
                    }}
                  />
                )}
                {view === "list" && (
                  <TaskListView
                    tasks={tasks}
                    deriveStatus={deriveStatus}
                    onRowClick={openOverview}
                    onEdit={startEdit}
                    onDelete={deleteTask}
                    onStatusChange={updateTaskStatus}
                    completeTask={completeTask}
                    taskStresses={taskStresses}
                  />
                )}
                {view === "table" && (
                  <TaskTableView
                    tasks={tasks}
                    deriveStatus={deriveStatus}
                    onRowClick={openOverview}
                    onEdit={startEdit}
                    onDelete={deleteTask}
                    onStatusChange={updateTaskStatus}
                    completeTask={completeTask}
                    taskStresses={taskStresses}
                  />
                )}
              </div>

              {showSidebar && (
                <aside className="w-full lg:w-80 rounded-xl border border-gray-200 bg-white shadow-sm overflow-y-auto">
                  <div className="p-5">
                    {/* Smart Summary */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-bold">Smart Summary</div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${stressLevel === "Low"
                              ? "bg-blue-100 text-blue-700"
                              : stressLevel === "Moderate"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {stressLevel}
                        </span>
                      </div>
                      <p className="text-sm mb-2">
                        Overall stress from current tasks: <strong>{overallStress}%</strong>
                      </p>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full transition-all duration-500 ${stressLevel === "Low" ? "bg-blue-500" : stressLevel === "Moderate" ? "bg-orange-500" : "bg-red-500"
                            }`}
                          style={{ width: `${overallStress}%` }}
                        />
                      </div>
                      <p className="text-sm mb-2">
                        Main contributors: <span className="font-medium">{mainContributors}</span>
                      </p>

                      {/* Per-task stress percentages */}
                      <div className="mt-3">
                        <div className="text-sm font-semibold mb-2">Task stress percentages</div>
                        <div className="max-h-48 overflow-auto pr-1">
                          {activeTasks.length === 0 ? (
                            <div className="text-xs text-gray-500">No tasks yet.</div>
                          ) : (
                            activeTasks.map((t) => {
                              const stress = getTaskStress(t);
                              return (
                                <div key={t.id} className="mb-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="truncate max-w-[70%]">{t.title}</span>
                                    <span className="tabular-nums">{stress}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${stress < 33 ? "bg-blue-400" : stress < 66 ? "bg-orange-400" : "bg-red-500"
                                        }`}
                                      style={{ width: `${stress}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Stress Reducer Recommendations */}
                    <div className="mb-6">
                      <div className="text-lg font-bold mb-3">AI Stress Reducer Recommendations</div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-300 inline-block mt-1.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal TaskForm */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingTaskId ? "Edit Task" : "Add Task"}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={closeForm}
          />
          {/* Dialog */}
          <div
            className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5">
              <h2 className="text-lg font-semibold">
                {editingTaskId ? "Edit Task" : "Add Task"}
              </h2>
              <button
                className="p-2 rounded-md hover:bg-gray-100"
                onClick={closeForm}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-1 pb-5">
              <TaskForm
                data={formData}
                setData={setFormData}
                error={formError}
                isEditing={Boolean(editingTaskId)}
                onSubmit={editingTaskId ? saveEdit : addTask}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}

      {viewTaskId && (
        <TaskOverview
          task={viewingTask}
          onClose={closeOverview}
          onEdit={() => startEdit(viewingTask)}
          onDelete={() => {
            deleteTask(viewingTask.id);
            closeOverview();
          }}
          onStatusChange={(status) => updateTaskStatus(viewingTask.id, status)}
          completeTask={() => {
            completeTask(viewingTask.id);
            closeOverview();
          }}
          deriveStatus={deriveStatus}
          taskStress={taskStresses[viewingTask.id] || 0}
        />
      )}
    </div>
  );
}