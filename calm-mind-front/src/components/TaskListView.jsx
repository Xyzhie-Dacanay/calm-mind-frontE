  import React from "react";

export default function TaskListView({
  tasks,
  deriveStatus,
  onStart,
  onComplete,
  onStatusChange,
  onEdit,
  onDelete
}) {
  const grouped = { todo: [], in_progress: [], missing: [], completed: [] };
  tasks.forEach((t) => grouped[deriveStatus(t)].push(t));

  const Section = ({ title, status }) => (
    <div className="mb-6">
      <h3 className="font-semibold text-lg mb-2">{title} ({grouped[status].length})</h3>
      <div className="space-y-2">
        {grouped[status].map((task) => (
          <div key={task.id} className="bg-white border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="font-medium">{task.title}</div>
              <div className="text-xs text-gray-500">
                {task.startDate ? `Start: ${task.startDate}` : null}
                {task.startDate && task.dueDate ? " • " : null}
                {task.dueDate ? `Due: ${task.dueDate}` : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {status === "todo" ? (
                <>
                  <button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={() => onStart(task.id)}>
                    Start
                  </button>
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input type="checkbox" onChange={(e) => e.target.checked && onComplete(task.id)} className="h-4 w-4" />
                    Mark as Completed
                  </label>
                </>
              ) : (
                ["todo", "in_progress", "completed"]
                  .filter((s) => s !== status)
                  .map((s) => (
                    <button
                      key={s}
                      className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                      onClick={() => onStatusChange(task.id, s)}
                    >
                      Move to {s === "todo" ? "To Do" : s === "in_progress" ? "In Progress" : "Completed"}
                    </button>
                  ))
              )}

              <button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={() => onEdit(task)}>
                Edit
              </button>
              <button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={() => onDelete(task.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {grouped[status].length === 0 && <div className="text-sm text-gray-500">No tasks here yet.</div>}
      </div>
    </div>
  );

    return (
      <div className="space-y-8 max-w-8xl mx-auto p-4">
        <Section title="To Do" status="todo" />
        <Section title="In Progress" status="in_progress" />
        <Section title="Overdue" status="missing" />
        <Section title="Completed" status="completed" />
      </div>
    );
  }