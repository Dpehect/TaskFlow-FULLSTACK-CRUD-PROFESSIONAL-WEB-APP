"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { TaskPriority } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { createTask } from "@/lib/actions/tasks";
import { taskFormSchema, type TaskFormValues } from "@/lib/validations";
import { suggestSimilarTitles } from "@/lib/smart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type CreateTaskFormProps = {
  projectId: string;
  /** Existing titles in this project (for smart suggestions). */
  existingTitles?: string[];
};

export function CreateTaskForm({
  projectId,
  existingTitles = [],
}: CreateTaskFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      dueDate: "",
    },
  });

  const titleValue = form.watch("title");
  const suggestions = useMemo(
    () => suggestSimilarTitles(titleValue ?? "", existingTitles, 4),
    [titleValue, existingTitles]
  );

  const resetAndClose = () => {
    form.reset({
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      dueDate: "",
    });
    setOpen(false);
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        await createTask({
          projectId,
          title: values.title,
          description: values.description,
          priority: values.priority,
          dueDate: values.dueDate
            ? new Date(`${values.dueDate}T12:00:00`).toISOString()
            : undefined,
        });
        toast.success("Task added");
        resetAndClose();
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not create task"
        );
      }
    });
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          form.reset({
            title: "",
            description: "",
            priority: TaskPriority.MEDIUM,
            dueDate: "",
          });
        }
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="size-4" />
            Add task
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>
              Tasks start in To Do. Drag them across the board to update status.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="Write project brief"
                disabled={isPending}
                aria-invalid={!!form.formState.errors.title}
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}

              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                      <Sparkles className="size-3.5 text-indigo-500" />
                      Similar tasks in this project
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {suggestions.map((title) => (
                        <button
                          key={title}
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            form.setValue("title", title, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                        >
                          <Badge
                            variant="outline"
                            className="max-w-[16rem] cursor-pointer truncate font-normal hover:bg-muted"
                          >
                            {title}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description (optional)</Label>
              <Input
                id="task-description"
                placeholder="Short notes…"
                disabled={isPending}
                {...form.register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                disabled={isPending}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                {...form.register("priority")}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">Due date (optional)</Label>
              <Input
                id="task-due"
                type="date"
                disabled={isPending}
                {...form.register("dueDate")}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
