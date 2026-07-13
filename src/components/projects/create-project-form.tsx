"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { createProject } from "@/lib/actions/projects";
import { projectFormSchema, type ProjectFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
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

type CreateProjectFormProps = {
  triggerLabel?: string;
  size?: "default" | "sm";
};

export function CreateProjectForm({
  triggerLabel = "New project",
  size = "default",
}: CreateProjectFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6366f1",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const project = await createProject({
          name: values.name,
          description: values.description,
          color: values.color,
        });
        toast.success("Project created");
        form.reset({ name: "", description: "", color: "#6366f1" });
        setOpen(false);
        router.push(`/dashboard/projects/${project.id}`);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not create project"
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
          form.reset({ name: "", description: "", color: "#6366f1" });
        }
      }}
    >
      <DialogTrigger
        render={
          <Button size={size}>
            <Plus className="size-4" />
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Start a board to organize tasks with drag and drop.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Name</Label>
              <Input
                id="project-name"
                placeholder="Website redesign"
                disabled={isPending}
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description (optional)</Label>
              <Textarea
                id="project-description"
                placeholder="What is this project about?"
                disabled={isPending}
                rows={3}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-color">Accent color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="project-color"
                  type="color"
                  className="h-9 w-14 cursor-pointer p-1"
                  disabled={isPending}
                  {...form.register("color")}
                />
                <span className="text-xs text-muted-foreground">
                  Used on cards and the board header
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
