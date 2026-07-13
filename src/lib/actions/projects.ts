"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { projectFormSchema } from "@/lib/validations";

export async function getProjects() {
  const userId = await requireUserId();
  return prisma.project.findMany({
    where: { userId },
    include: {
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProjectWithTasks(projectId: string) {
  const userId = await requireUserId();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      tasks: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!project) {
    return null;
  }

  return project;
}

export async function createProject(input: z.infer<typeof projectFormSchema>) {
  const userId = await requireUserId();
  const data = projectFormSchema.parse(input);

  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description || null,
      color: data.color ?? "#6366f1",
      userId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${project.id}`);
  return project;
}

export async function updateProject(
  projectId: string,
  input: z.infer<typeof projectFormSchema>
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const userId = await requireUserId();
    const data = projectFormSchema.parse(input);

    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });
    if (!existing) {
      return { success: false, error: "Project not found" };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description || null,
        color: data.color ?? "#6366f1",
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("updateProject failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project",
    };
  }
}

export async function deleteProject(
  projectId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const userId = await requireUserId();

    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });
    if (!existing) {
      return { success: false, error: "Project not found" };
    }

    await prisma.project.delete({ where: { id: projectId } });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("deleteProject failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}
