import React, { useEffect, useMemo, useState } from "react";
import { Plus, MoreVertical, Kanban, List, Table, X } from "lucide-react";
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
  }, [theme]); // ✅ fixed dependency and removed stray commas

  const toggleTheme = (forced) => {
    setTheme((prev) =>
      typeof forced === "string" ? forced : prev === "dark" ? "light" : "dark"
    );
  };

  // View
  const [view, setView] = useState("board");

  // ===== Tick so "Missing" recomputes after midnight without reload =====
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
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

  const isPast = (due_date) => {
    if (!due_date) return false;
    const t = new Date(due_date).getTime();
    return t < startOfTodayTS;
  };

  // ===== Derived status mapping (matches column keys) =====
  const deriveStatus = (task) => {
    if (task.status === "completed") return "completed";
    if (isPast(task.dueDate)) return "missing";
    return task.status;
  };


  // ===== tasksByStatus (for Kanban) =====
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
    if (!data.due_date) errs.push("Due date is required.");
    setFormError(errs.join(" "));
    return errs.length === 0;
  };

  const addTask = async () => {
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

  const saveEdit = async () => {
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

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:4000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error('Task delete error:', error);
    }
  };

  const deleteAll = async () => {
    if (!window.confirm("Delete ALL tasks? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:4000/api/tasks?user_id=${user?.user_id || 'test_user'}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks([]);
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error('Task delete all error:', error);
    }
  };

  // Overview drawer
  const [viewTaskId, setViewTaskId] = useState(null);
  const openOverview = (task) => setViewTaskId(task.id);
  const closeOverview = () => setViewTaskId(null);
  const viewingTask = useMemo(() => tasks.find((t) => t._id === viewTaskId) || null, [tasks, viewTaskId]);

  // Columns
  const columns = [
    { title: "To Do", status: "todo" },
    { title: "In Progress", status: "in_progress" },
    { title: "Missing", status: "missing" },
    { title: "Completed", status: "completed" }
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
