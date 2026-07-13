"use client";

import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import type { DashboardProjectSummary } from "@/types/dashboard";
import { cn } from "@/lib/utils";

type ProjectsSectionProps = {
  projects: DashboardProjectSummary[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Open a board to manage tasks with drag and drop.
          </p>
        </div>
        <CreateProjectForm />
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>
              Create your first project to start tracking work on TaskFlow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateProjectForm />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="transition hover:bg-muted/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                    aria-hidden
                  />
                  <CardTitle className="truncate">{project.name}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FolderKanban className="size-3.5" />
                  {project.taskCount} tasks
                </p>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                >
                  Open board
                  <ArrowRight className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
