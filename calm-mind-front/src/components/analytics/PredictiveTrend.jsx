// src/components/analytics/PredictiveTrend.jsx
import React, { useMemo } from "react";
import Card from "../../components/HoverCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { computeRegression } from "../../utils/analyticsData";

const GOLD = "#B9A427";
const CHAR = "#222322";

export default function PredictiveTrend({ tasks, stressSeries, periods }) {
  // Build aligned array [{label, workload, stress}]
  const rows = useMemo(() => {
    const mapStress = new Map(stressSeries.map((s) => [s.label, s.stress]));
    const mapWork = new Map(periods.map((p) => [p.key, 0]));
    tasks.forEach((t) => {
      const d = new Date(t.dueDate || t.startDate || new Date(Number(t.id)).toISOString().slice(0, 10));
      periods.forEach((p) => {
        if (d >= p.start && d <= p.end) {
          mapWork.set(p.key, (mapWork.get(p.key) || 0) + 1);
        }
      });
    });
    return periods.map((p) => ({
      label: p.label,
      workload: mapWork.get(p.key) || 0,
      stress: mapStress.get(p.label) || 0,
    }));
  }, [tasks, stressSeries, periods]);

  const xs = rows.map((r) => r.workload);
  const ys = rows.map((r) => r.stress);
  const reg = computeRegression(xs, ys); // { a, b }
  const data = rows.map((r) => ({ ...r, predicted: +(reg.a + reg.b * r.workload).toFixed(2) }));
  const has = rows.some((r) => r.workload > 0 || r.stress > 0);

  const insight = useMemo(() => {
    if (!has) return "Not enough data to compute a trend.";
    const b = reg.b || 0;
    const lastStress = data[data.length - 1]?.stress || 0;
    const predictedStress = data[data.length - 1]?.predicted || 0;
    const trend = predictedStress > lastStress ? "increase" : "decrease";
    const nextFriday = new Date();
    nextFriday.setDate(nextFriday.getDate() + (5 - nextFriday.getDay() + 7) % 7);
    
    let message = "";
    if (Math.abs(b) < 0.03) {
      message = "Predicted impact is minimal — stress changes are weakly tied to workload.";
    } else if (b > 0) {
      const projectedStress = Math.min(5, predictedStress + b * 2).toFixed(1);
      message = `If current workload continues, stress may ${trend} to ${projectedStress} by ${nextFriday.toLocaleDateString('en-US', { weekday: 'long' })}. Consider taking breaks to manage stress levels.`;
    } else {
      message = `Model suggests stress will ${trend}. Keep up the good work with task management!`;
    }
    return message;
  }, [has, reg.b, data]);

  return (
    <Card className="p-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Predictive Trend (Stress vs Workload)</h2>
        <span className="text-xs text-gray-500">Simple linear regression</span>
      </div>
      {has ? (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, Math.max(5, Math.ceil(Math.max(...ys, 5)))]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="stress" name="Stress (actual)" stroke={GOLD} strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="predicted" name="Stress (predicted)" stroke={CHAR} strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[320px] grid place-items-center">
          <div className="w-full h-full border-2 border-dashed rounded-xl grid place-items-center text-gray-400 text-sm px-4 text-center">
            Not enough data to compute a trend.
          </div>
        </div>
      )}
      <p className="mt-3 text-sm text-gray-500">
        {insight} This is a simple, illustrative model — use it to spot direction, not as a diagnostic metric.
      </p>
    </Card>
  );
}
