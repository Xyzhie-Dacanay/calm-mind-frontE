import React from "react";

export default function TaskTableView({
  tasks,
  deriveStatus,
  onStart,
  onComplete,
  onStatusChange,
  onEdit,
  onDelete
}) {
  const rows = tasks.map((t) => ({ ...t, eff: deriveStatus(t) }));

  return (
    <div className="overflow-x-auto bg-white border rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="text-left bg-gray-50">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="px-4 py-3">{t.title}</td>
              <td className="px-4 py-3">{t.priority}</td>
              <td className="px-4 py-3">{t.startDate || "-"}</td>
              <td className="px-4 py-3">{t.dueDate || "-"}</td>
              <td className="px-4 py-3 capitalize">
                {t.eff === "in_progress" ? "In Progress" : t.eff}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {t.eff === "todo" ? (
                    <>
                      <button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={() => onStart(t.id)}>
                        Start
                      </button>
                      <label className="inline-flex items-center gap-2 text-xs">
                        <input type="checkbox" onChange={(e) => e.target.checked && onComplete(t.id)} className="h-4 w-4" />
                        Completed
                      </label>
                    </>
                  ) : (
                    ["todo", "in_progress", "completed"]
                      .filter((s) => s !== t.eff)
                      .map((s) => (
                        <button
                          key={s}
                          className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                          onClick={() => onStatusChange(t.id, s)}
                        >
                          Move to {s === "todo" ? "To Do" : s === "in_progress" ? "In Progress" : "Completed"}
                        </button>
                      ))
                  )}

                  <button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={() => onEdit(t)}>
                    Edit
                  </button>
                  <button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={() => onDelete(t.id)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-gray-500" colSpan={6}>
                No tasks yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
