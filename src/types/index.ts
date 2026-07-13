import type { Project, Task, TaskPriority, TaskStatus } from "@prisma/client";

export type { Project, Task, TaskPriority, TaskStatus };

/** Task shape after RSC → client serialization (Dates become ISO strings). */
export type ClientTask = Omit<Task, "dueDate" | "createdAt" | "updatedAt"> & {
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectWithTasks = Project & {
  tasks: Task[];
};

export type DueLabel = "OVERDUE" | "DUE_SOON" | "ON_TRACK" | "NO_DATE";

export type TaskWithMeta = Task & {
  dueLabel?: DueLabel;
};
