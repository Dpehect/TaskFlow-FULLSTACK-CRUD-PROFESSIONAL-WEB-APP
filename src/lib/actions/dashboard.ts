"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildPriorityChart,
  buildStatusChart,
  computeStats,
} from "@/lib/dashboard";
import type { DashboardPayload, DashboardTask } from "@/types/dashboard";

/**
 * Single round-trip for the dashboard: projects + all tasks + derived stats.
 */
export async function getDashboardData(): Promise<DashboardPayload> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;
  const userName = session.user.name ?? null;

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      tasks: {
        orderBy: [{ updatedAt: "desc" }],
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const tasks: DashboardTask[] = projects.flatMap((project) =>
    project.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      order: task.order,
      projectId: project.id,
      projectName: project.name,
      projectColor: project.color,
    }))
  );

  // Newest activity first for the list default
  tasks.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const projectSummaries = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    color: project.color,
    taskCount: project.tasks.length,
    updatedAt: project.updatedAt.toISOString(),
  }));

  return {
    userName,
    projects: projectSummaries,
    tasks,
    stats: computeStats(tasks, projects.length),
    statusChart: buildStatusChart(tasks),
    priorityChart: buildPriorityChart(tasks),
  };
}
