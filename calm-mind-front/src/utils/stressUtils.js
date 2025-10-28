/**
 * Calculate stress level for a single task based on multiple factors
 */
export function calculateTaskStress(task, now, deriveStatus) {
  let stress = 0;
  const status = deriveStatus(task);
  
  // Base stress from status
  if (status === "missing") return 100;
  if (status === "completed" || status === "done_late") return 0;
  
  // Deadline proximity stress
  if (task.dueDate) {
    const dueTS = new Date(`${task.dueDate}T23:59:59`).getTime();
    const daysToDue = (dueTS - now) / 86400000;
    if (daysToDue < 0) {
      stress += 100;
    } else if (daysToDue <= 7) {
      stress += Math.max(0, 100 - (daysToDue / 7) * 100);
    } else {
      stress += Math.max(0, 50 - (daysToDue / 14) * 50);
    }
  }

  // Priority stress
  if (task.priority === "High") stress += 30;
  else if (task.priority === "Medium") stress += 15;

  // In Progress tasks add extra stress
  if (status === "in_progress") stress += 20;

  return Math.min(100, Math.floor(stress));
}

/**
 * Calculate average stress for tasks in a specific status
 */
export function calculateAverageStressByStatus(tasks, status, now, deriveStatus) {
  // Skip completed tasks as per requirement
  if (status === "completed") return { count: 0, avgStress: 0 };
  
  const statusTasks = tasks.filter(task => deriveStatus(task) === status);
  if (statusTasks.length === 0) return { count: 0, avgStress: 0 };

  const totalStress = statusTasks.reduce((sum, task) => 
    sum + calculateTaskStress(task, now, deriveStatus), 0);

  return {
    count: statusTasks.length,
    avgStress: Math.round(totalStress / statusTasks.length)
  };
}

/**
 * Calculate workload impact on stress
 */
export function calculateWorkloadStress(tasks, now, deriveStatus) {
  const activeTasks = tasks.filter(task => {
    const status = deriveStatus(task);
    return status !== "completed" && status !== "done_late";
  });

  let workloadStress = 0;
  const activeCount = activeTasks.length;

  // Base workload stress
  if (activeCount > 10) workloadStress = 100;
  else if (activeCount > 5) workloadStress = 60 + (activeCount - 5) * 8;
  else if (activeCount > 0) workloadStress = activeCount * 12;

  // Add stress for high priority tasks
  const highPriorityCount = activeTasks.filter(t => t.priority === "High").length;
  workloadStress += highPriorityCount * 10;

  // Add stress for tasks due soon
  const soon = now + (3 * 24 * 60 * 60 * 1000); // 3 days
  const dueSoonCount = activeTasks.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate).getTime();
    return dueDate <= soon;
  }).length;
  workloadStress += dueSoonCount * 15;

  return Math.min(100, Math.round(workloadStress));
}

/**
 * Get stressor distribution from tasks
 */
export function getStressorDistribution(tasks) {
  const stressors = {
    "Time Pressure": 0,
    "Complexity": 0,
    "Workload": 0,
    "Priority": 0,
    "Overdue": 0
  };

  tasks.forEach(task => {
    // Time pressure from due dates
    if (task.dueDate) {
      const daysToDeadline = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysToDeadline < 0) stressors["Overdue"]++;
      else if (daysToDeadline < 3) stressors["Time Pressure"]++;
    }

    // Complexity from description length and tags
    if (task.description && task.description.length > 200) stressors["Complexity"]++;
    if (task.tags && task.tags.length > 2) stressors["Complexity"]++;

    // Workload from active tasks
    if (task.status === "in_progress") stressors["Workload"]++;

    // Priority stress
    if (task.priority === "High") stressors["Priority"]++;
  });

  return Object.entries(stressors).map(([name, value]) => ({
    name,
    value,
    pct: tasks.length ? Math.round((value / tasks.length) * 100) : 0
  }));
}

/**
 * Predict future stress levels based on current tasks and trends
 */
export function predictStressLevels(tasks, now, deriveStatus, daysToPredict = 14) {
  const predictions = [];
  const baseDate = new Date(now);
  
  for (let i = 0; i < daysToPredict; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    // Calculate predicted stress for this date
    const dateStr = date.toISOString().split('T')[0];
    const relevantTasks = tasks.filter(task => {
      const status = deriveStatus(task);
      if (status === "completed" || status === "done_late") return false;
      
      // Include tasks due on or before this date
      if (task.dueDate && task.dueDate <= dateStr) return true;
      
      // Include in-progress tasks
      return status === "in_progress";
    });

    const workloadStress = calculateWorkloadStress(relevantTasks, date.getTime(), deriveStatus);
    const avgTaskStress = relevantTasks.length ? 
      relevantTasks.reduce((sum, task) => sum + calculateTaskStress(task, date.getTime(), deriveStatus), 0) / relevantTasks.length 
      : 0;

    predictions.push({
      date: dateStr,
      predictedStress: Math.round((workloadStress + avgTaskStress) / 2),
      activeTaskCount: relevantTasks.length
    });
  }

  return predictions;
}

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