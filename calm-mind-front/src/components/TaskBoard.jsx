import React from "react";
import TaskCard from "./TaskCard";

export default function TaskBoard({
  columns,
  tasksByStatus,
  onCardClick,
  onEdit,
  onDelete,
  onStatusChange,
  completeTask,
  deriveStatus,
  // NEW:
  taskStresses = {},
  StressIndicator,
  onAddTask,
}) {
  const getColumnStyle = (status) => {
    switch (status) {
      case "todo":
        return { bg: "bg-[#1F1F1D]", text: "text-white", dot: "bg-amber-300/60" };
      case "in_progress":
        return { bg: "bg-[#1F1F1D]", text: "text-white", dot: "bg-blue-300/60" };
      case "completed":
        return { bg: "bg-[#1F1F1D]", text: "text-white", dot: "bg-green-300/60" };
      case "missing":
        return { bg: "bg-[#1F1F1D]", text: "text-white", dot: "bg-red-300" };
      default:
        return { bg: "bg-[#1F1F1D]", text: "text-white", dot: "bg-gray-300/60" };
    }
  };

  return (
    <div className="grid grid-cols-1 grid-rows-4 md:grid-cols-4 md:grid-rows-1 gap-4 w-full h-full">
      {columns.map((col) => {
        const style = getColumnStyle(col.status);
        const columnTasks = tasksByStatus[col.status] || [];

        return (
          <div key={col.status} className="flex flex-col w-full min-w-0 min-h-0">
            <div className={`flex items-center justify-between px-4 py-2 rounded-full ${style.bg} ${style.text} shadow-sm transition-shadow hover:shadow-md`}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${style.dot}`} />
                <span className="font-semibold text-sm">{col.title}</span>
                <span className="text-xs opacity-70">({columnTasks.length})</span>
              </div>
              <button
                className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => onAddTask(col.status)}
              >
                +
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto h-[calc(100%-40px)] pr-1">
              {columnTasks.length === 0 && (
                <div className={`text-sm ${dark ? "text-gray-300" : "text-gray-500"}`}>No tasks here yet.</div>
              )}

              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
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