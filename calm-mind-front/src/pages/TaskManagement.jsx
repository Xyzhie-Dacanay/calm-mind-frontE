import React, { useEffect, useMemo, useState } from "react";
import { Plus, MoreVertical } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TaskBoard from "../components/TaskBoard";
import TaskListView from "../components/TaskListView";
import TaskTableView from "../components/TaskTableView";
import TaskForm from "../components/TaskForm";
import TaskOverview from "../components/TaskOverview";
import KebabMenu from "../components/KebabMenu";
import axios from 'axios';
import { useAuthStore } from "../store/authStore";
import api from "../api/client";

// ===== Task type =====
// Task = {
//   id: string,
//   title: string,
//   status: 'todo' | 'in_progress' | 'missing' | 'completed',
//   priority: 'Low' | 'Medium' | 'High',
//   startDate: 'YYYY-MM-DD',
//   dueDate: 'YYYY-MM-DD',
//   description: string
// }


const TaskManagement = ({ onTaskUpdate }) => {
  const { user, token, logout } = useAuthStore();

  const userId = user?.user_id || "test_user";

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

  // ===== View =====
  const [view, setView] = useState("kanban");

  // ===== Tick so "Overdue" recomputes after midnight without reload =====
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000); // 1 min
    return () => clearInterval(id);
  }, []);

  // ===== Tasks (fetch from backend) =====
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user || !token) return;

      try {
        const res = await api.get("/tasks", {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: userId },
        });

        // Use response data, not local tasks state
        const mappedTasks = res.data.map(t => ({
          _id: t._id,
          title: t.title,
          description: t.description || "",
          priority: t.priority || "Low",
          startDate: t.start_date ? new Date(t.start_date).toISOString().split("T")[0] : "-",
          dueDate: t.due_date ? new Date(t.due_date).toISOString().split("T")[0] : "-",
          status: t.status || "todo",
          subtasks: t.subtasks || [],
        }));
        setTasks(mappedTasks);


      } catch (err) {
        console.error("❌ Error fetching tasks:", err);
        console.log("Fetched tasks:", res.data);

      }
    };

    fetchTasks();
  }, [user, token]);





  const startTask = (taskId) => {
    updateTaskStatus(taskId, "in_progress");
  };


  // ===== Date helpers & derived status (auto Overdue) =====
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
    if (isPast(task.dueDate)) return "missing";   // <-- use dueDate
    if (task.status === "todo" || task.status === "Pending") return "todo";
    return task.status;
  };


  // ===== tasksByStatus (for Kanban) =====
  const tasksByStatus = useMemo(() => {
    const map = { todo: [], in_progress: [], missing: [], completed: [] };
    tasks.forEach((t) => {
      const statusKey = deriveStatus(t);
      if (map[statusKey]) map[statusKey].push(t);
    });
    return map;
  }, [tasks]);


  // ===== Add/Edit Form with Subtasks =====
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    status: "",
    due_date: "",
    subtasks: []
  });

  const resetForm = () => {
    setEditingTaskId(null);
    setFormError("");
    setFormData({
      title: "",
      status: "Pending",
      due_date: "",
      subtasks: []
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

    try {
      console.log("🟡 Submitting task data:", formData);

      const now = new Date(); // current date-time
      const startDateISO = now.toISOString(); // ISO format for backend

      const res = await axios.post(
        "http://localhost:4000/api/tasks",
        {
          user_id: userId,
          title: formData.title.trim(),
          status: formData.status,
          due_date: formData.due_date,
          start_date: new Date().toISOString(), // <-- send ISO string
          subtasks: formData.subtasks || [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );



      // Map backend fields to frontend-friendly fields
      const newTask = {
        _id: res.data.task._id,
        title: res.data.task.title,
        description: res.data.task.description,
        priority: res.data.task.priority || "Low",
        startDate: res.data.task.start_date
          ? new Date(res.data.task.start_date).toISOString().split("T")[0]
          : null,
        dueDate: res.data.task.due_date
          ? new Date(res.data.task.due_date).toISOString().split("T")[0]
          : null,
        status: res.data.task.status,
        subtasks: res.data.task.subtasks || [],
      };

      setTasks((prev) => [...prev, newTask]);
      setShowForm(false);
      resetForm();
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error("❌ Task create error:", error.response?.data || error.message);
      setFormError(error.response?.data?.message || "Failed to create task.");
    }
  };



  const startEdit = (task) => {
    setEditingTaskId(task._id);
    setFormError("");
    setFormData({
      title: task.title,
      status: task.status,
      due_date: task.due_date.split('T')[0],
      subtasks: task.subtasks || []
    });
    setShowForm(true);
  };

  const saveEdit = async () => {
    if (!validate()) return;
    try {
      const res = await axios.put(
        `http://localhost:4000/api/tasks/${editingTaskId}/reschedule`, // <--- fixed
        { due_date: formData.due_date, subtasks: formData.subtasks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) =>
        prev.map((t) =>
          t._id === editingTaskId
            ? { ...t, title: formData.title.trim(), due_date: res.data.task.due_date, status: res.data.task.status, subtasks: res.data.task.subtasks }
            : t
        )
      );
      setShowForm(false);
      resetForm();
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error('Task edit error:', error);
      setFormError('Failed to edit task.');
    }
  };

  // ===== Split Task =====
  const splitTask = async (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    const subtasks = prompt('Enter subtask titles (comma-separated):')?.split(',').map((title) => ({ title: title.trim(), completed: false })) || [];
    if (subtasks.length === 0) return;
    try {
      const res = await axios.post(
        `http://localhost:4000/api/tasks/${taskId}/split`,
        { subtasks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, subtasks: res.data.task.subtasks } : t))
      );
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error('Task split error:', error);
    }
  };

  // ===== Status transitions =====
  const updateTaskStatus = async (taskId, newStatus) => {
    if (newStatus === "Overdue") return;

    try {
      await axios.put(
        `http://localhost:4000/api/tasks/${taskId}`, // <-- use this endpoint
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(prev =>
        prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t)
      );
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error('Task status update error:', error);
    }
  };



  // Mark task completed
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

  // ===== Overview drawer =====
  const [viewTaskId, setViewTaskId] = useState(null);
  const openOverview = (task) => setViewTaskId(task._id);
  const closeOverview = () => setViewTaskId(null);
  const viewingTask = useMemo(() => tasks.find((t) => t._id === viewTaskId) || null, [tasks, viewTaskId]);

  // ===== Columns =====
  const columns = [
    { title: "To Do", status: "todo" },
    { title: "In Progress", status: "in_progress" },
    { title: "Missing", status: "missing" },
    { title: "Completed", status: "completed" }
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
                      className={`px-3 py-1 text-sm rounded-full transition ${view === v.key ? "bg-[#b7a42f] text-white" : "hover:bg-gray-100"
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
                  onStart={startTask}
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
                  onStart={startTask}
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
export default TaskManagement;