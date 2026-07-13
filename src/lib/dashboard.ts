import type { TaskPriority, TaskStatus } from "@prisma/client";
import { getDueLabel, PRIORITY_LABELS } from "@/lib/kanban";
import type {
  DashboardStats,
  DashboardTask,
  DueFilter,
  PriorityChartPoint,
  StatusChartPoint,
  TaskFiltersState,
} from "@/types/dashboard";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const STATUS_CHART_COLORS: Record<TaskStatus, string> = {
  TODO: "var(--chart-status-todo)",
  IN_PROGRESS: "var(--chart-status-progress)",
  DONE: "var(--chart-status-done)",
};

export const PRIORITY_CHART_COLORS: Record<TaskPriority, string> = {
  LOW: "var(--chart-priority-low)",
  MEDIUM: "var(--chart-priority-medium)",
  HIGH: "var(--chart-priority-high)",
};

export const DEFAULT_FILTERS: TaskFiltersState = {
  query: "",
  status: "ALL",
  priority: "ALL",
  due: "ALL",
  projectId: "ALL",
};

export function computeStats(
  tasks: DashboardTask[],
  projectCount: number
): DashboardStats {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const todoTasks = tasks.filter((t) => t.status === "TODO").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== "DONE" && getDueLabel(t.dueDate) === "OVERDUE"
  ).length;

  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    totalProjects: projectCount,
    totalTasks,
    completedTasks,
    completionRate,
    todoTasks,
    inProgressTasks,
    overdueTasks,
  };
}

export function buildStatusChart(tasks: DashboardTask[]): StatusChartPoint[] {
  const counts: Record<TaskStatus, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };

  for (const task of tasks) {
    counts[task.status] += 1;
  }

  return (Object.keys(counts) as TaskStatus[]).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: counts[status],
    fill: STATUS_CHART_COLORS[status],
  }));
}

export function buildPriorityChart(tasks: DashboardTask[]): PriorityChartPoint[] {
  const counts: Record<TaskPriority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };

  for (const task of tasks) {
    counts[task.priority] += 1;
  }

  return (Object.keys(counts) as TaskPriority[]).map((priority) => ({
    priority,
    label: PRIORITY_LABELS[priority],
    count: counts[priority],
    fill: PRIORITY_CHART_COLORS[priority],
  }));
}

function matchesDueFilter(task: DashboardTask, due: DueFilter): boolean {
  if (due === "ALL") return true;
  return getDueLabel(task.dueDate) === due;
}

export function filterTasks(
  tasks: DashboardTask[],
  filters: TaskFiltersState
): DashboardTask[] {
  const q = filters.query.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.projectId !== "ALL" && task.projectId !== filters.projectId) {
      return false;
    }
    if (filters.status !== "ALL" && task.status !== filters.status) {
      return false;
    }
    if (filters.priority !== "ALL" && task.priority !== filters.priority) {
      return false;
    }
    if (!matchesDueFilter(task, filters.due)) {
      return false;
    }
    if (q) {
      const haystack = `${task.title} ${task.description ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function countActiveFilters(filters: TaskFiltersState): number {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.status !== "ALL") count += 1;
  if (filters.priority !== "ALL") count += 1;
  if (filters.due !== "ALL") count += 1;
  if (filters.projectId !== "ALL") count += 1;
  return count;
}
