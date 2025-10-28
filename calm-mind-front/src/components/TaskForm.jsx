import React from "react";
import StatusDropdown from "./StatusDropdown";

export default function TaskForm({
  data,
  setData,
  error,
  onSubmit,
  onCancel,
  isEditing,
}) {
  const set = (name, value) => setData((p) => ({ ...p, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          name="title"
          value={data.title || ""}
          onChange={(e) => set("title", e.target.value)}
          required
          minLength={3}
          className="w-full rounded border px-3 py-2"
          placeholder="e.g., Prepare weekly report"
        />
      </div>

      {/* ===== Row 1: Status, Priority, Start Date ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <StatusDropdown
            value={data.status || "todo"}
            onChange={(s) => set("status", s)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            name="priority"
            value={data.priority || "Low"}
            onChange={(e) => set("priority", e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={data.startDate || ""}
            onChange={(e) => set("startDate", e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      {/* ===== Row 2: Due Date & Description ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Due Date *</label>
          <input
            type="date"
            name="due_date"
            value={data.due_date || ""}
            onChange={(e) => set("due_date", e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={data.description || ""}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full rounded border px-3 py-2"
            placeholder="Notes, links, acceptance criteria…"
          />
        </div>
      </div>

      {/* ===== Buttons ===== */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <button
          type="button"
          className="px-3 py-2 rounded border hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded text-white hover:opacity-90"
          style={{ background: "#b7a42f" }}
        >
          {isEditing ? "Save Changes" : "Add Task"}
        </button>
      </div>
    </form>
  );
}
