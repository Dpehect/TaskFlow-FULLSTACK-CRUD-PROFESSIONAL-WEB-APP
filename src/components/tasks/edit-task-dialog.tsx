"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { ClientTask } from "@/types";
import {
  editTaskFormSchema,
  type EditTaskFormValues,
} from "@/lib/validations";
import { updateTask, deleteTask } from "@/lib/actions/tasks";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type EditTaskDialogProps = {
  task: ClientTask;
  compact?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
};

function toDateInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function EditTaskDialog({
  task,
  compact = false,
  onPointerDown,
}: EditTaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      dueDate: toDateInput(task.dueDate),
      status: task.status,
    },
  });

  const openChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      form.reset({
        title: task.title,
        description: task.description ?? "",
        priority: task.priority,
        dueDate: toDateInput(task.dueDate),
        status: task.status,
      });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateTask({
        taskId: task.id,
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate,
        status: values.status,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Task updated");
      setOpen(false);
      router.refresh();
    });
  });

  const onDelete = () => {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Task deleted");
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTrigger
        onPointerDown={onPointerDown}
        className={cn(
          compact
            ? buttonVariants({ variant: "ghost", size: "xs" })
            : buttonVariants({ variant: "outline", size: "sm" }),
          "gap-1"
        )}
      >
        <Pencil className="size-3.5" />
        {compact ? "Edit" : "Edit task"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>
              Update details or change status without dragging.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-title-${task.id}`}>Title</Label>
              <Input
                id={`edit-title-${task.id}`}
                disabled={isPending}
                aria-invalid={!!form.formState.errors.title}
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-desc-${task.id}`}>Description</Label>
              <Textarea
                id={`edit-desc-${task.id}`}
                rows={3}
                disabled={isPending}
                {...form.register("description")}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`edit-priority-${task.id}`}>Priority</Label>
                <select
                  id={`edit-priority-${task.id}`}
                  disabled={isPending}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                  {...form.register("priority")}
                >
                  <option value={TaskPriority.LOW}>Low</option>
                  <option value={TaskPriority.MEDIUM}>Medium</option>
                  <option value={TaskPriority.HIGH}>High</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edit-status-${task.id}`}>Status</Label>
                <select
                  id={`edit-status-${task.id}`}
                  disabled={isPending}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                  {...form.register("status")}
                >
                  <option value={TaskStatus.TODO}>To Do</option>
                  <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TaskStatus.DONE}>Done</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-due-${task.id}`}>Due date</Label>
              <Input
                id={`edit-due-${task.id}`}
                type="date"
                disabled={isPending}
                {...form.register("dueDate")}
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
