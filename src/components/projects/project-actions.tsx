"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { updateProject, deleteProject } from "@/lib/actions/projects";
import { projectFormSchema, type ProjectFormValues } from "@/lib/validations";
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

type ProjectActionsProps = {
  project: {
    id: string;
    name: string;
    description: string | null;
    color: string;
  };
  /** After delete, go to dashboard */
  redirectOnDelete?: boolean;
  compact?: boolean;
};

export function ProjectActions({
  project,
  redirectOnDelete = true,
  compact = false,
}: ProjectActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      color: project.color,
    },
  });

  const openChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      form.reset({
        name: project.name,
        description: project.description ?? "",
        color: project.color,
      });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateProject(project.id, values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Project updated");
      setOpen(false);
      router.refresh();
    });
  });

  const onDelete = () => {
    startTransition(async () => {
      const result = await deleteProject(project.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Project deleted");
      setOpen(false);
      if (redirectOnDelete) {
        router.push("/dashboard");
      }
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTrigger
        className={cn(
          buttonVariants({
            variant: compact ? "ghost" : "outline",
            size: compact ? "sm" : "sm",
          }),
          "gap-1"
        )}
      >
        <Pencil className="size-3.5" />
        {compact ? "Edit" : "Edit project"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>
              Rename the workspace or update its description and color.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`proj-name-${project.id}`}>Name</Label>
              <Input
                id={`proj-name-${project.id}`}
                disabled={isPending}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`proj-desc-${project.id}`}>Description</Label>
              <Textarea
                id={`proj-desc-${project.id}`}
                rows={3}
                disabled={isPending}
                {...form.register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`proj-color-${project.id}`}>Color</Label>
              <Input
                id={`proj-color-${project.id}`}
                type="color"
                className="h-9 w-14 cursor-pointer p-1"
                disabled={isPending}
                {...form.register("color")}
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
              Delete project
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
