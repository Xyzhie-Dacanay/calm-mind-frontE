import React from "react";

export default function TaskListView({
  tasks = [],
  deriveStatus,
  onStart,
  onComplete,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const grouped = { todo: [], in_progress: [], missing: [], completed: [] };

  // Safely group tasks by status
  tasks.forEach((task) => {
    const status = deriveStatus ? deriveStatus(task) : task.status;
    const safeStatus = grouped[status] ? status : "todo";
    grouped[safeStatus].push(task);
  });

  const Section = ({ title, status }) => {
    const list = grouped[status] || [];

    return (
      <div className="mb-6" key={status}>
        <h3 className="font-semibold text-lg mb-2">
          {title} <span className="text-gray-400">({list.length})</span>
        </h3>

        <div className="space-y-2">
          {list.map((task, index) => (
            <div
              key={task._id || `${status}-${index}`} // ✅ guaranteed unique key
              className="bg-white border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
            >
              <div>
                <div className="font-medium">{task.title}</div>
                <div className="text-xs text-gray-500">
                  {task.startDate && `Start: ${task.startDate}`}
                  {task.startDate && task.dueDate && " • "}
                  {task.dueDate && `Due: ${task.dueDate}`}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {status === "todo" ? (
                  <>
                    <button
                      key={`${task._id}-start`}
                      className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                      onClick={() => onStart?.(task._id)}
                    >
                      Start
                    </button>
                    <label
                      key={`${task._id}-complete`}
                      className="inline-flex items-center gap-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          e.target.checked && onComplete?.(task._id)
                        }
                        className="h-4 w-4"
                      />
                      Mark as Completed
                    </label>
                  </>
                ) : (
                  ["todo", "in_progress", "completed"]
                    .filter((s) => s !== status)
                    .map((s) => (
                      <button
                        key={`${task._id}-${s}`} // ✅ unique key for buttons
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                        onClick={() => onStatusChange?.(task._id, s)}
                      >
                        Move to{" "}
                        {s === "todo"
                          ? "To Do"
                          : s === "in_progress"
                          ? "In Progress"
                          : "Completed"}
                      </button>
                    ))
                )}

                <button
                  key={`${task._id}-edit`}
                  className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                  onClick={() => onEdit?.(task)}
                >
                  Edit
                </button>
                <button
                  key={`${task._id}-delete`}
                  className="text-xs px-2 py-1 rounded border hover:bg-red-50 text-red-600"
                  onClick={() => onDelete?.(task._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {list.length === 0 && (
            <div className="text-sm text-gray-500">No tasks here yet.</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Section title="To Do" status="todo" />
      <Section title="In Progress" status="in_progress" />
      <Section title="Missing" status="missing" />
      <Section title="Completed" status="completed" />
    </div>
  );
}
