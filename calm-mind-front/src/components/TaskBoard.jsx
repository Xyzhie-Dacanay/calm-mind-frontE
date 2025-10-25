import React from "react";
import TaskCard from "./TaskCard";

export default function TaskBoard({
  columns,
  tasksByStatus,
  onCardClick,
  onEdit,
  onDelete,
  onStatusChange,
  completeTask
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
      {columns.map((col) => {
        const dark = col.status === "in_progress" || col.status === "completed";
        const columnTasks = tasksByStatus[col.status] || [];

        return (
          <div
            key={col.status}
            className={`rounded-2xl p-4 shadow-sm h-[calc(100vh-138px)] ${dark ? "" : "bg-card"}`}
            style={dark ? { background: "#1F1F1D" } : {}}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${dark ? "bg-blue-100" : "bg-yellow-300/60"}`} />
                <div className={`font-semibold ${dark ? "text-white" : "text-primary"}`}>
                  {col.title} <span className="opacity-60">({columnTasks.length})</span>
                </div>
              </div>
              <div className={dark ? "text-gray-300" : "text-gray-400"}>⋮</div>
            </div>

            <div className="space-y-2 overflow-y-auto h-[calc(100%-40px)] pr-1">
              {columnTasks.length === 0 && (
                <div className={`text-sm ${dark ? "text-gray-300" : "text-gray-500"}`}>No tasks here yet.</div>
              )}

              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id || task._id || `${col.status}-${Math.random()}`}
                  task={task}
                  derivedStatus={(t) => col.status} // already grouped by derived status
                  onClick={onCardClick}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  completeTask={completeTask}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
