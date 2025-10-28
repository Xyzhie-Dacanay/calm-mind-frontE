// src/components/analytics/KpiCards.jsx
import React from "react";

export default function KpiCards({ totals, stressAverages, colors }) {
  const items = [
    { label: "To Do", value: totals.todo, stress: stressAverages.todo },
    { label: "In Progress", value: totals.in_progress, stress: stressAverages.in_progress },
    { label: "Missing", value: totals.missing, stress: stressAverages.missing },
    { label: "Completed", value: totals.completed, stress: stressAverages.completed },
  ];

  const getStressColor = (stress) => {
    if (stress >= 75) return 'text-red-500';
    if (stress >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {items.map((m) => (
        <div key={m.label} className="rounded-2xl p-6 shadow-sm" style={{ background: colors.cardBg, color: "#fff" }}>
          <div className="text-sm text-gray-300">{m.label}</div>
          <div className="text-4xl font-extrabold mt-2" style={{ color: colors.gold }}>
            {m.value}
          </div>
          {m.label !== "Completed" && (
            <div className={`text-sm mt-2 ${getStressColor(m.stress)}`}>
              Avg Stress: {m.stress}%
              {m.stress >= 75 && ' 🔴'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
