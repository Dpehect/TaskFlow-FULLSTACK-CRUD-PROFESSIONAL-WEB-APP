"use client";

import type { TaskStatus } from "@prisma/client";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ClientTask } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KANBAN_COLUMNS } from "@/lib/kanban";
import { KanbanTaskCard } from "@/components/kanban/KanbanTaskCard";

type KanbanColumnProps = {
  status: TaskStatus;
  tasks: ClientTask[];
  projectId: string;
  disabled?: boolean;
};

export function KanbanColumn({
  status,
  tasks,
  projectId,
  disabled = false,
}: KanbanColumnProps) {
  const meta = KANBAN_COLUMNS.find((column) => column.id === status)!;
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column" as const,
      status,
    },
  });

  const taskIds = tasks.map((task) => task.id);

  return (
    <section
      className={cn(
        "flex min-h-[28rem] min-w-[16rem] flex-1 flex-col rounded-xl border bg-muted/30",
        meta.headerClass,
        isOver && "border-primary/50 bg-primary/5 ring-2 ring-primary/15"
      )}
    >
      <header className="flex items-start justify-between gap-2 border-b px-3 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn("size-2.5 shrink-0 rounded-full", meta.accent)}
              aria-hidden
            />
            <h2 className="truncate text-sm font-semibold">{meta.title}</h2>
          </div>
          <p className="mt-0.5 pl-4 text-xs text-muted-foreground">
            {meta.description}
          </p>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {tasks.length}
        </Badge>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto p-2",
          isOver && "bg-primary/[0.03]"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              projectId={projectId}
              disabled={disabled}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            className={cn(
              "flex flex-1 items-center justify-center rounded-lg border border-dashed px-3 py-8 text-center text-xs text-muted-foreground",
              isOver && "border-primary/40 text-primary"
            )}
          >
            Drop tasks here
          </div>
        )}
      </div>
    </section>
  );
}
