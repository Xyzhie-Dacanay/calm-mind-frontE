// src/components/analytics/StressOverTime.jsx
import React, { useMemo } from "react";
import Card from "../../components/HoverCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const GOLD = "#B9A427";

// simple slope via least squares (x = 0..n-1)
function slopeY(series, key = "stress") {
  const pts = series
    .map((d, i) => ({ x: i, y: Number(d[key] || 0), label: d.label }))
    .filter((p) => Number.isFinite(p.y));
  if (pts.length < 2) return 0;
  const n = pts.length;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  pts.forEach(({ x, y }) => { sx += x; sy += y; sxx += x * x; sxy += x * y; });
  const denom = n * sxx - sx * sx;
  if (!denom) return 0;
  return (n * sxy - sx * sy) / denom;
}

function summarize(series) {
  const vals = series.map(d => Number(d.stress || 0)).filter(v => v > 0);
  if (vals.length < 2) return "Add a few more logs to see a clear trend.";
  const first = vals[0], last = vals[vals.length - 1];
  const change = last - first;
  const slope = slopeY(series, "stress");
  const strong = Math.abs(slope) >= 0.05 || Math.abs(change) >= 0.3;

  if (change < -0.1 && slope < 0) return strong ? "Stress levels are trending down — nice!" : "Slight downtrend in stress.";
  if (change >  0.1 && slope > 0) return strong ? "Stress levels are trending up — monitor your workload." : "Slight uptick in stress.";
  return "Stress is relatively stable across the selected period.";
}

export default function StressOverTime({ periods, series }) {
  const has = series.some((d) => (d.stress || 0) > 0);
  const insight = useMemo(() => (has ? summarize(series) : "Add logs to see the trend."), [has, series]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Stress Level Over Time</h2>
        <span className="text-xs text-gray-500">Average stress per selected period</span>
      </div>
      {has ? (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="stress" stroke={GOLD} strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[300px] grid place-items-center">
          <div className="w-full h-full border-2 border-dashed rounded-xl grid place-items-center text-gray-400 text-sm px-4 text-center">
            No stress logs in this range.
          </div>
        </div>
      )}
      <p className="mt-3 text-sm text-gray-500">{insight}</p>
    </Card>
  );
}
