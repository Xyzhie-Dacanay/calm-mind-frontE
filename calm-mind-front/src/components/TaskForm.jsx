import React, { useEffect, useState } from "react";
import StatusDropdown from "./StatusDropdown";

const LS_CUSTOM_TAGS = "cm_custom_tags_v1";

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

  // Predefined base tags
  const baseTags = ["Projects", "Personal", "Deadline", "Family"];

  // Suggested tags for autocomplete
  const suggestedTags = [
    ...baseTags,
    "Exam",
    "Homework",
    "Group Work",
    "Presentation",
    "Financial",
    "Relationship",
    "Health",
    "Social",
    "Study",
    "Assignment",
    "Extracurricular",
    "Work",
    "Travel",
    "Sports",
    "Time Management",
    "Procrastination",
    "Peer Pressure",
    "Academic Pressure",
  ];

  // Custom tags (persisted in localStorage)
  const [customTags, setCustomTags] = useState(() => {
    const saved = localStorage.getItem(LS_CUSTOM_TAGS);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(LS_CUSTOM_TAGS, JSON.stringify(customTags));
  }, [customTags]);

  const tagOptions = [...new Set([...baseTags, ...customTags])];

  // Selected tags for the task
  const [selectedTags, setSelectedTags] = useState(data.tags || []);

  // Keep parent data.tags in sync
  useEffect(() => {
    set("tags", selectedTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags]);

  // Keep local selectedTags in sync when editing a different task
  useEffect(() => {
    setSelectedTags(data.tags || []);
  }, [data.tags]);

  // Adding new tag
  const [newTag, setNewTag] = useState("");

  const addCustomTag = () => {
    const t = newTag.trim().slice(0, 24);
    if (!t || tagOptions.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    setCustomTags((prev) => [...prev, t]);
    setSelectedTags((prev) => [...prev, t]);
    setNewTag("");
  };

  // Removing custom tag
  const removeCustomTag = (t) => {
    setCustomTags((prev) => prev.filter((x) => x !== t));
    setSelectedTags((prev) => prev.filter((x) => x !== t));
  };

  // Toggle tag selection
  const toggleTag = (t) => {
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          name="title"
          value={data.title}
          onChange={(e) => set("title", e.target.value)}
          required
          minLength={3}
          className="w-full rounded border px-3 py-2"
          placeholder="e.g., Prepare weekly report"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <StatusDropdown
            value={data.status === "missing" ? "todo" : data.status}
            onChange={(s) => set("status", s)} // parent blocks 'missing'
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            name="priority"
            value={data.priority}
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
            value={data.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Due Date *</label>
          <input
            type="date"
            name="dueDate"
            value={data.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={data.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full rounded border px-3 py-2"
            placeholder="Notes, links, acceptance criteria…"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <button type="button" className="px-3 py-2 rounded border hover:bg-gray-50" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="px-3 py-2 rounded text-white hover:opacity-90" style={{ background: "#b7a42f" }}>
          {isEditing ? "Save Changes" : "Add Task"}
        </button>
      </div>
    </form>
  );
}
