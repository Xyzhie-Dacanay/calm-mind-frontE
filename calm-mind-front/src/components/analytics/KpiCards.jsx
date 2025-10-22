// src/components/analytics/KpiCards.jsx
import React from "react";

export default function KpiCards({ totals, colors }) {
  const items = [
    { label: "To Do", value: totals.todo },
    { label: "In Progress", value: totals.in_progress },
    { label: "Missing", value: totals.missing },
    { label: "Completed", value: totals.completed },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {items.map((m) => (
        <div key={m.label} className="rounded-2xl p-6 shadow-sm" style={{ background: colors.cardBg, color: "#fff" }}>
          <div className="text-sm text-gray-300">{m.label}</div>
          <div className="text-4xl font-extrabold mt-2" style={{ color: colors.gold }}>
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}
