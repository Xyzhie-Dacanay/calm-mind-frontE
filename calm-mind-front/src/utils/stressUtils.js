// Build tag distribution from stress logs (any custom tag included)
export function getTagDistributionFromLogs(stressLogsInRange) {
  const counts = new Map(); // tag -> count
  stressLogsInRange.forEach((l) => {
    (l.tags || []).forEach((raw) => {
      const tag = String(raw || "").trim();
      if (!tag) return;
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  return Array.from(counts.entries()).map(([name, value]) => ({
    name,
    value,
    pct: total ? Math.round((value / total) * 100) : 0,
  }));
}
