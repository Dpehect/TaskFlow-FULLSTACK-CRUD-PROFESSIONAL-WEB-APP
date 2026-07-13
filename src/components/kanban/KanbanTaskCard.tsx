"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ClientTask } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDueLabel, PRIORITY_LABELS } from "@/lib/kanban";
import { DueLabelBadge } from "@/components/tasks/due-label-badge";
import { SmartBreakDown } from "@/components/tasks/smart-break-down";

type KanbanTaskCardProps = {
  task: ClientTask;
  projectId: string;
  isDragOverlay?: boolean;
  disabled?: boolean;
};

const priorityVariant: Record<
  ClientTask["priority"],
  "secondary" | "outline" | "destructive"
> = {
  LOW: "secondary",
  MEDIUM: "outline",
  HIGH: "destructive",
};

export function KanbanTaskCard({
  task,
  projectId,
  isDragOverlay = false,
  disabled = false,
}: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task" as const,
      task,
    },
    disabled: disabled || isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueLabel = getDueLabel(task.dueDate);
  const isOverdue = dueLabel === "OVERDUE" && task.status !== "DONE";

  return (
    <Card
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      size="sm"
      className={cn(
        "gap-0 py-0 shadow-sm transition-shadow",
        isDragging && !isDragOverlay && "opacity-40 ring-2 ring-primary/30",
        isDragOverlay && "rotate-1 scale-[1.02] shadow-lg ring-2 ring-primary/20",
        isOverdue && "ring-1 ring-destructive/40",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="mt-0.5 cursor-grab touch-none text-muted-foreground/70 active:cursor-grabbing"
            aria-label="Drag task"
            {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
          >
            <GripVertical className="size-3.5 shrink-0" aria-hidden />
          </button>
          <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
            {task.title}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pl-5">
          <Badge variant={priorityVariant[task.priority]}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>

          <DueLabelBadge
            dueDate={task.dueDate}
            isDone={task.status === "DONE"}
            hideWhenDone
          />
        </div>

        {!isDragOverlay && (
          <div
            className="pl-5"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <SmartBreakDown
              projectId={projectId}
              parentTitle={task.title}
              compact
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
