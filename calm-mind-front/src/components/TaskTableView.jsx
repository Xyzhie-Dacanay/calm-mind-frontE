import React from "react";

export default function TaskTableView({
  tasks = [],
  deriveStatus,
  onStart,
  onComplete,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  // Add derived status
  const rows = tasks.map((t) => ({
    ...t,
    eff: deriveStatus(t),
    // Format dates to YYYY-MM-DD if they exist
    startDate: t.startDate ? new Date(t.startDate).toLocaleDateString() : "-",
    dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-",
  }));

  const statusLabel = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return (
    <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="text-left bg-gray-50">
          <tr>
            {["Title", "Priority", "Start", "Due", "Status", "Actions"].map(
              (header) => (
                <th key={header} className="px-4 py-3">
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((t, index) => (
              <tr
                key={`${t._id}-${index}`}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-3">{t.title}</td>
                <td className="px-4 py-3">{t.priority}</td>
                <td className="px-4 py-3">{t.startDate}</td>
                <td className="px-4 py-3">{t.dueDate}</td>
                <td className="px-4 py-3 capitalize">
                  {statusLabel[t.eff] || t.eff}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {t.eff === "todo" ? (
                      <React.Fragment key={`todo-actions-${t._id}-${index}`}>
                        <button
                          className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
                          onClick={() => onStart(t._id)}
                        >
                          Start
                        </button>
                        <label className="inline-flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            onChange={(e) =>
                              e.target.checked && onComplete(t._id)
                            }
                          />
                          Completed
                        </label>
                      </React.Fragment>
                    ) : (
                      ["todo", "in_progress", "completed"]
                        .filter((s) => s !== t.eff)
                        .map((s) => (
                          <button
                            key={`move-${t._id}-${s}-${index}`}
                            className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
                            onClick={() => onStatusChange(t._id, s)}
                          >
                            Move to {statusLabel[s]}
                          </button>
                        ))
                    )}

                    <button
                      key={`edit-${t._id}-${index}`}
                      className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
                      onClick={() => onEdit(t)}
                    >
                      Edit
                    </button>
                    <button
                      key={`delete-${t._id}-${index}`}
                      className="text-xs px-2 py-1 rounded border hover:bg-red-100 text-red-600"
                      onClick={() => onDelete(t._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-6 text-gray-500 text-center" colSpan={6}>
                No tasks yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
