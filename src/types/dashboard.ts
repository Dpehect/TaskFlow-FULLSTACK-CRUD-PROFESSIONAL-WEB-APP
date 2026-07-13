import type { TaskPriority, TaskStatus } from "@prisma/client";
import type { DueLabel } from "@/types";

/** Serializable task row for the dashboard task list. */
export type DashboardTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  order: number;
  projectId: string;
  projectName: string;
  projectColor: string;
};

export type DashboardProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  taskCount: number;
  updatedAt: string;
};

export type DashboardStats = {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  todoTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
};

export type StatusChartPoint = {
  status: TaskStatus;
  label: string;
  count: number;
  fill: string;
};

export type PriorityChartPoint = {
  priority: TaskPriority;
  label: string;
  count: number;
  fill: string;
};

export type DueFilter = "ALL" | "OVERDUE" | "DUE_SOON" | "ON_TRACK" | "NO_DATE";

export type TaskFiltersState = {
  query: string;
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  due: DueFilter;
  projectId: string | "ALL";
};

export type DashboardPayload = {
  stats: DashboardStats;
  statusChart: StatusChartPoint[];
  priorityChart: PriorityChartPoint[];
  tasks: DashboardTask[];
  projects: DashboardProjectSummary[];
  userName: string | null;
};

export type { DueLabel };
