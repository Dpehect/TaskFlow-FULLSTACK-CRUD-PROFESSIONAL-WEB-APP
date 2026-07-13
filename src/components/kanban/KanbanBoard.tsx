"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import type { TaskStatus } from "@prisma/client";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ClientTask } from "@/types";
import {
  KANBAN_COLUMNS,
  groupTasksByStatus,
  isTaskStatus,
  type TasksByStatus,
} from "@/lib/kanban";
import { reorderTasks } from "@/lib/actions/tasks";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanTaskCard } from "@/components/kanban/KanbanTaskCard";

type KanbanBoardProps = {
  projectId: string;
  initialTasks: ClientTask[];
};

function findContainer(
  columns: TasksByStatus,
  id: UniqueIdentifier
): TaskStatus | null {
  if (isTaskStatus(String(id))) {
    return id as TaskStatus;
  }

  for (const status of Object.keys(columns) as TaskStatus[]) {
    if (columns[status].some((task) => task.id === id)) {
      return status;
    }
  }

  return null;
}

function serializeColumns(columns: TasksByStatus) {
  return (Object.keys(columns) as TaskStatus[]).flatMap((status) =>
    columns[status].map((task, index) => ({
      id: task.id,
      status,
      order: index,
    }))
  );
}

function normalizeOrders(columns: TasksByStatus): TasksByStatus {
  return {
    TODO: columns.TODO.map((t, i) => ({ ...t, status: "TODO" as const, order: i })),
    IN_PROGRESS: columns.IN_PROGRESS.map((t, i) => ({
      ...t,
      status: "IN_PROGRESS" as const,
      order: i,
    })),
    DONE: columns.DONE.map((t, i) => ({ ...t, status: "DONE" as const, order: i })),
  };
}

export function KanbanBoard({ projectId, initialTasks }: KanbanBoardProps) {
  const [columns, setColumns] = useState<TasksByStatus>(() =>
    groupTasksByStatus(initialTasks)
  );
  const [activeTask, setActiveTask] = useState<ClientTask | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setColumns(groupTasksByStatus(initialTasks));
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /** Optimistic UI first; persist all status + order via server action. */
  const persistColumns = useCallback(
    (next: TasksByStatus, previous: TasksByStatus) => {
      const updates = serializeColumns(next);
      startTransition(async () => {
        const result = await reorderTasks({ projectId, updates });
        if (!result.success) {
          setColumns(previous);
          toast.error(result.error || "Could not update board");
        }
      });
    },
    [projectId]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const container = findContainer(columns, active.id);
    if (!container) return;
    const task = columns[container].find((item) => item.id === active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(columns, activeId);
    const overContainer = findContainer(columns, overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setColumns((prev) => {
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;

      const [moved] = activeItems.splice(activeIndex, 1);
      const updatedMoved: ClientTask = { ...moved, status: overContainer };

      let newIndex: number;
      if (isTaskStatus(String(overId))) {
        newIndex = overItems.length;
      } else {
        const overIndex = overItems.findIndex((t) => t.id === overId);
        newIndex = overIndex >= 0 ? overIndex : overItems.length;
      }

      overItems.splice(newIndex, 0, updatedMoved);

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(columns, activeId);
    const overContainer = findContainer(columns, overId) ?? activeContainer;

    if (!activeContainer || !overContainer) return;

    const previousSnapshot = groupTasksByStatus(initialTasks);

    if (activeContainer === overContainer) {
      const items = columns[activeContainer];
      const oldIndex = items.findIndex((t) => t.id === activeId);
      const newIndex = isTaskStatus(String(overId))
        ? items.length - 1
        : items.findIndex((t) => t.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      if (oldIndex === newIndex) {
        // Cross-column moves already applied in dragOver — still need persist
        const next = normalizeOrders(columns);
        const changed =
          JSON.stringify(serializeColumns(next)) !==
          JSON.stringify(serializeColumns(previousSnapshot));
        if (changed) {
          setColumns(next);
          persistColumns(next, previousSnapshot);
        }
        return;
      }

      const reordered = arrayMove(items, oldIndex, newIndex).map(
        (task, index) => ({
          ...task,
          order: index,
          status: activeContainer,
        })
      );

      const next = normalizeOrders({
        ...columns,
        [activeContainer]: reordered,
      });
      setColumns(next);
      persistColumns(next, previousSnapshot);
      return;
    }

    const next = normalizeOrders(columns);
    setColumns(next);
    persistColumns(next, previousSnapshot);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <div className="relative space-y-3">
      {isPending && (
        <div className="absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-md border bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
          <Loader2 className="size-3.5 animate-spin" />
          Saving…
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              status={column.id}
              tasks={columns[column.id]}
              projectId={projectId}
              disabled={isPending}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
          {activeTask ? (
            <div className="w-[min(100vw-2rem,18rem)]">
              <KanbanTaskCard
                task={activeTask}
                projectId={projectId}
                isDragOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
