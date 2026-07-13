"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

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

export async function createProject(input: z.infer<typeof createProjectSchema>) {
  const userId = await requireUserId();
  const data = createProjectSchema.parse(input);

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
