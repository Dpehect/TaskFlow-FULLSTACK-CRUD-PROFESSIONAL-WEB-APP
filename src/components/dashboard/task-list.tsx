"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardTask } from "@/types/dashboard";
import { STATUS_LABELS } from "@/lib/dashboard";
import { PRIORITY_LABELS } from "@/lib/kanban";
import { DueLabelBadge } from "@/components/tasks/due-label-badge";

type TaskListProps = {
  tasks: DashboardTask[];
  hasFilters: boolean;
};

const statusVariant: Record<
  DashboardTask["status"],
  "secondary" | "outline" | "default"
> = {
  TODO: "secondary",
  IN_PROGRESS: "outline",
  DONE: "default",
};

const priorityVariant: Record<
  DashboardTask["priority"],
  "secondary" | "outline" | "destructive"
> = {
  LOW: "secondary",
  MEDIUM: "outline",
  HIGH: "destructive",
};

export function TaskList({ tasks, hasFilters }: TaskListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>
          {hasFilters
            ? "Results match your current search and filters."
            : "Recent activity across all projects."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-12 text-center">
            <Inbox className="size-8 text-muted-foreground/60" />
            <p className="text-sm font-medium">No tasks found</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              {hasFilters
                ? "Try clearing filters or broadening your search."
                : "Create a project and add tasks to see them here."}
            </p>
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            <AnimatePresence initial={false} mode="popLayout">
              {tasks.map((task) => (
                <motion.li
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Link
                    href={`/dashboard/projects/${task.projectId}`}
                    className="flex flex-col gap-2 px-3 py-3 transition hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium">{task.title}</p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: task.projectColor }}
                          aria-hidden
                        />
                        <FolderKanban className="size-3 shrink-0" />
                        <span className="truncate">{task.projectName}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                      <Badge variant={statusVariant[task.status]}>
                        {STATUS_LABELS[task.status]}
                      </Badge>
                      <Badge variant={priorityVariant[task.priority]}>
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                      <DueLabelBadge
                        dueDate={task.dueDate}
                        isDone={task.status === "DONE"}
                        hideWhenDone
                      />
                    </div>
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
