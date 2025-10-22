import React, { useEffect, useMemo, useState } from "react";
import { Plus, MoreVertical } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TaskBoard from "../components/TaskBoard";
import TaskListView from "../components/TaskListView";
import TaskTableView from "../components/TaskTableView";
import TaskForm from "../components/TaskForm";
import TaskOverview from "../components/TaskOverview";
import KebabMenu from "../components/KebabMenu";

/**
 * Task = {
 *   id: string,
 *   title: string,
 *   status: 'todo' | 'in_progress' | 'missing' | 'completed',
 *   priority: 'Low' | 'Medium' | 'High',
 *   startDate: 'YYYY-MM-DD',
 *   dueDate: 'YYYY-MM-DD',
 *   description: string
 * }
 */

const STORAGE_KEY = "tasks";

export default function TaskManagement() {
  // ===== Theme =====
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("cm-theme") || "light"; } catch { return "light"; }
  });
  useEffect(() => {
    try { localStorage.setItem("cm-theme", theme); } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("cm-dark", theme === "dark");
    }
  }, [theme]);
  const toggleTheme = (forced) => {
    setTheme((prev) => (typeof forced === "string" ? forced : prev === "dark" ? "light" : "dark"));
  };

  // ===== View =====
  const [view, setView] = useState("kanban");

  // ===== Tick so "Missing" recomputes after midnight without reload =====
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000); // 1 min
    return () => clearInterval(id);
  }, []);

  // ===== Tasks (persist) =====
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(stored) ? stored : [];
    } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  // ===== Date helpers & derived status (auto Missing) =====
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
    return task.status;
  };

  const tasksByStatus = useMemo(() => {
    const map = { todo: [], in_progress: [], missing: [], completed: [] };
    tasks.forEach((t) => map[deriveStatus(t)].push(t));
    return map;
  }, [tasks, deriveStatus]);

  // ===== Add/Edit Form =====
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
      // block manual 'missing', map "done" dropdown to 'completed'
      status: formData.status === "missing" ? "todo" : formData.status,
      priority: formData.priority,
      startDate: formData.startDate || "",
      dueDate: formData.dueDate || "",
      description: formData.description || "",
    };
    setTasks((prev) => [...prev, newTask]);
    setShowForm(false);
    resetForm();
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setFormError("");
    setFormData({
      title: task.title,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate,
      dueDate: task.dueDate,
      description: task.description,
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
              status: formData.status === "missing" ? t.status : formData.status,
              priority: formData.priority,
              startDate: formData.startDate || "",
              dueDate: formData.dueDate || "",
              description: formData.description || "",
            }
          : t
      )
    );
    setShowForm(false);
    resetForm();
  };

  // ===== Status transitions (block manual "missing") =====
  const updateTaskStatus = (taskId, newStatus) => {
    if (newStatus === "missing") return;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };
  const completeTask = (taskId) => updateTaskStatus(taskId, "completed");

  const deleteTask = (taskId) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const deleteAll = () => {
    if (!window.confirm("Delete ALL tasks? This cannot be undone.")) return;
    setTasks([]);
  };

  // ===== Overview drawer =====
  const [viewTaskId, setViewTaskId] = useState(null);
  const openOverview = (task) => setViewTaskId(task.id);
  const closeOverview = () => setViewTaskId(null);
  const viewingTask = useMemo(() => tasks.find((t) => t.id === viewTaskId) || null, [tasks, viewTaskId]);

  // ===== Columns =====
  const columns = [
    { title: "To Do", status: "todo" },
    { title: "In Progress", status: "in_progress" },
    { title: "Missing", status: "missing" },
    { title: "Completed", status: "completed" },
  ];

  return (
    <div className="min-h-screen h-screen">
      <div className="h-full w-full flex">
        <Sidebar theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-2 min-h-2 grid grid-cols-12 px-2 pb-6 pt-2 w-full">
          <div className="col-span-12">
            {/* Header */}
            <div className="h-[80px] w-full bg-card border border-gray-200 rounded-2xl shadow-sm px-4 flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>

              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="hidden sm:flex items-center gap-1 bg-card rounded-full px-1 py-1 border border-gray-200">
                  {[
                    { key: "kanban", label: "Kanban" },
                    { key: "list", label: "List" },
                    { key: "table", label: "Table" },
                  ].map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setView(v.key)}
                      className={`px-3 py-1 text-sm rounded-full transition ${
                        view === v.key ? "bg-[#b7a42f] text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                {/* Add (icon) */}
                <button
                  onClick={() => { resetForm(); setShowForm(true); }}
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-gray-200 shadow-sm hover:bg-gray-50 transition"
                  aria-label="Add Task"
                >
                  <Plus size={18} />
                </button>

                {/* 3-dot menu */}
                <KebabMenu
                  triggerClass="px-2 py-2 rounded-md bg-card border border-gray-200 shadow-sm hover:bg-gray-50 transition"
                  triggerIcon={<MoreVertical size={18} />}
                  items={[
                    { key: "delete-all", label: "Delete All Tasks", danger: true, onClick: deleteAll },
                    // future: { key: "export", label: "Export JSON", onClick: exportFn }
                  ]}
                />
              </div>
            </div>

            {/* Content */}
            <div className="mt-3">
              {view === "kanban" && (
                <TaskBoard
                  columns={columns}
                  tasksByStatus={tasksByStatus}
                  onCardClick={openOverview}
                  onEdit={startEdit}
                  onDelete={deleteTask}
                  onStatusChange={updateTaskStatus}
                  completeTask={completeTask}
                />
              )}

              {view === "list" && (
                <TaskListView
                  tasks={tasks}
                  deriveStatus={deriveStatus}
                  onRowClick={(t) => openOverview(t)}
                  onEdit={startEdit}
                  onDelete={deleteTask}
                  onStatusChange={updateTaskStatus}
                  completeTask={completeTask}
                />
              )}

              {view === "table" && (
                <TaskTableView
                  tasks={tasks}
                  deriveStatus={deriveStatus}
                  onRowClick={(t) => openOverview(t)}
                  onEdit={startEdit}
                  onDelete={deleteTask}
                  onStatusChange={updateTaskStatus}
                  completeTask={completeTask}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="absolute inset-0 bg-black/10" onClick={() => { setShowForm(false); resetForm(); }} />
          <div className="relative rounded-xl w-[920px] shadow-lg border border-gray-200 bg-white overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-[#f5eed6]">
              <h3 className="text-lg font-semibold">{editingTaskId ? "Edit Task" : "Add New Task"}</h3>
              <button className="text-gray-500" onClick={() => { setShowForm(false); resetForm(); }}>✕</button>
            </div>

            <TaskForm
              data={formData}
              setData={setFormData}
              error={formError}
              onSubmit={editingTaskId ? saveEdit : addTask}
              onCancel={() => { setShowForm(false); resetForm(); }}
              isEditing={!!editingTaskId}
            />
          </div>
        </div>
      )}

      {/* Overview Drawer */}
      {viewingTask && (
        <TaskOverview
          task={viewingTask}
          derivedStatus={deriveStatus(viewingTask)}
          onClose={closeOverview}
          onEdit={(t) => { closeOverview(); startEdit(t); }}
          onDelete={(id) => { closeOverview(); deleteTask(id); }}
          onStatusChange={(id, s) => updateTaskStatus(id, s)}
        />
      )}
    </div>
  );
}
