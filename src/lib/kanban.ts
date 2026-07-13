import type { TaskPriority, TaskStatus } from "@prisma/client";
import type { ClientTask, DueLabel } from "@/types";

export const KANBAN_COLUMNS = [
  {
    id: "TODO" as const,
    title: "To Do",
    description: "Ready to start",
    accent: "bg-slate-500",
    headerClass: "border-slate-200 dark:border-slate-700",
  },
  {
    id: "IN_PROGRESS" as const,
    title: "In Progress",
    description: "Actively working",
    accent: "bg-amber-500",
    headerClass: "border-amber-200 dark:border-amber-900/50",
  },
  {
    id: "DONE" as const,
    title: "Done",
    description: "Completed",
    accent: "bg-emerald-500",
    headerClass: "border-emerald-200 dark:border-emerald-900/50",
  },
] as const;

export type KanbanColumnId = (typeof KANBAN_COLUMNS)[number]["id"];

export type TasksByStatus = Record<TaskStatus, ClientTask[]>;

function toTime(value: string | Date): number {
  return new Date(value).getTime();
}

export function groupTasksByStatus(tasks: ClientTask[]): TasksByStatus {
  const groups: TasksByStatus = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };

  for (const task of tasks) {
    groups[task.status].push(task);
  }

  for (const status of Object.keys(groups) as TaskStatus[]) {
    groups[status].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return toTime(a.createdAt) - toTime(b.createdAt);
    });
  }

  return groups;
}

/**
 * Automatic due labels (client-side only).
 * - Overdue: past due
 * - Due Soon: within 3 days (inclusive)
 * - On Track: more than 3 days away
 */
export function getDueLabel(dueDate: Date | string | null | undefined): DueLabel {
  if (!dueDate) return "NO_DATE";

  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (Number.isNaN(due.getTime())) return "NO_DATE";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.floor(
    (startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "OVERDUE";
  if (diffDays <= 3) return "DUE_SOON";
  return "ON_TRACK";
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export function isTaskStatus(value: string): value is TaskStatus {
  return value === "TODO" || value === "IN_PROGRESS" || value === "DONE";
}
