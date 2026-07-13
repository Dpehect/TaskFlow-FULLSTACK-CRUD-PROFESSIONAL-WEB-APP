import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectWithTasks } from "@/lib/actions/projects";
import { KanbanBoard } from "@/components/kanban";
import { CreateTaskForm } from "@/components/projects/create-task-form";
import { ProjectActions } from "@/components/projects/project-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClientTask } from "@/types";
import { ArrowLeft } from "lucide-react";

type ProjectBoardPageProps = {
  params: Promise<{ projectId: string }>;
};

function toClientTasks(
  tasks: Awaited<
    NonNullable<Awaited<ReturnType<typeof getProjectWithTasks>>>
  >["tasks"]
): ClientTask[] {
  return tasks.map((task) => ({
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));
}

export default async function ProjectBoardPage({
  params,
}: ProjectBoardPageProps) {
  const { projectId } = await params;
  const project = await getProjectWithTasks(projectId);

  if (!project) {
    notFound();
  }

  const clientTasks = toClientTasks(project.tasks);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 w-fit"
            )}
          >
            <ArrowLeft className="size-3.5" />
            All projects
          </Link>
          <div className="flex items-center gap-2">
            <span
              className="size-3.5 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden
            />
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          </div>
          {project.description && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ProjectActions
            project={{
              id: project.id,
              name: project.name,
              description: project.description,
              color: project.color,
            }}
          />
          <CreateTaskForm
            projectId={project.id}
            existingTitles={project.tasks.map((t) => t.title)}
          />
        </div>
      </div>

      {clientTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="text-sm font-medium">No tasks on this board yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a task to start dragging across To Do, In Progress, and Done.
          </p>
          <div className="mt-4 flex justify-center">
            <CreateTaskForm
              projectId={project.id}
              existingTitles={[]}
            />
          </div>
        </div>
      ) : null}

      <KanbanBoard projectId={project.id} initialTasks={clientTasks} />
    </div>
  );
}
