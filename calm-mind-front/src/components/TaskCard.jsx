import React from "react";
import { Pencil, Trash2, Play, CheckCircle } from "lucide-react";
import StatusDropdown from "./StatusDropdown";

export default function TaskCard({
  task,
  derivedStatus,
  onClick,          // open overview
  onEdit,
  onDelete,
  onStatusChange,
  completeTask
}) {
  const eff = derivedStatus(task);
  const canQuickActions = eff === "todo" || eff === "in_progress";

  return (
    <div
      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow transition cursor-pointer"
      onClick={() => onClick(task)}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium line-clamp-2">{task.title}</h3>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="p-1 rounded hover:bg-gray-100" aria-label="Edit" onClick={() => onEdit(task)}>
            <Pencil size={16} />
          </button>
          <button className="p-1 rounded hover:bg-gray-100" aria-label="Delete" onClick={() => onDelete(task.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {(task.startDate || task.dueDate) && (
        <div className="text-xs text-gray-500 mt-1">
          {task.startDate ? `Start: ${task.startDate}` : null}
          {task.startDate && task.dueDate ? " • " : null}
          {task.dueDate ? `Due: ${task.dueDate}` : null}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className={`inline-block px-2 py-1 text-xs rounded-full
          ${task.priority === "High" ? "bg-red-100 text-red-800" :
            task.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
            "bg-green-100 text-green-800"}`}>
          {task.priority}
        </span>

        {/* Notion-style status dropdown (blocked from 'missing' by parent) */}
        {eff !== "missing" ? (
          <div onClick={(e) => e.stopPropagation()}>
            <StatusDropdown
              value={task.status}
              onChange={(s) => onStatusChange(task.id, s)}
              menuAlign="right"
            />
          </div>
        ) : (
          <span className="text-xs text-red-600">Overdue</span>
        )}
      </div>

      {/* Quick actions */}
      {canQuickActions && (
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {eff === "todo" && (
            <button
              className="flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-gray-50"
              onClick={() => onStatusChange(task.id, "in_progress")}
            >
              <Play size={14} /> Start
            </button>
          )}
          <button
            className="flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-gray-50"
            onClick={() => completeTask(task.id)}
          >
            <CheckCircle size={14} /> Mark Done
          </button>
        </div>
      )}
    </div>
  );
}
