"use server";

import { revalidatePath } from "next/cache";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { isTaskStatus } from "@/lib/kanban";
import { taskFormSchema } from "@/lib/validations";

/** Ensures the task belongs to the signed-in user via its project. */
async function getOwnedTask(taskId: string, userId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      project: { userId },
    },
    include: {
      project: { select: { id: true, userId: true } },
    },
  });
}

const updateStatusSchema = z.object({
  taskId: z.string().min(1),
  status: z.nativeEnum(TaskStatus),
  order: z.number().int().min(0).optional(),
});

/**
 * Move a task to a new Kanban column (and optional position).
 * Called from the board on drag-end.
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  order?: number
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const userId = await requireUserId();
    const parsed = updateStatusSchema.parse({ taskId, status, order });

    if (!isTaskStatus(parsed.status)) {
      return { success: false, error: "Invalid status" };
    }

    const task = await getOwnedTask(parsed.taskId, userId);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    const nextOrder =
      parsed.order ??
      (await prisma.task.count({
        where: {
          projectId: task.projectId,
          status: parsed.status,
          NOT: { id: task.id },
        },
      }));

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: parsed.status,
        order: nextOrder,
      },
    });

    revalidatePath(`/dashboard/projects/${task.projectId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("updateTaskStatus failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

const reorderSchema = z.object({
  projectId: z.string().min(1),
  updates: z
    .array(
      z.object({
        id: z.string().min(1),
        status: z.nativeEnum(TaskStatus),
        order: z.number().int().min(0),
      })
    )
    .min(1),
});

/**
 * Batch-update status + order after a multi-column drag (preferred for consistency).
 */
export async function reorderTasks(input: z.infer<typeof reorderSchema>): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    const userId = await requireUserId();
    const data = reorderSchema.parse(input);

    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId },
      select: { id: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    const taskIds = data.updates.map((u) => u.id);
    const ownedCount = await prisma.task.count({
      where: {
        id: { in: taskIds },
        projectId: data.projectId,
      },
    });

    if (ownedCount !== taskIds.length) {
      return { success: false, error: "One or more tasks are invalid" };
    }

    await prisma.$transaction(
      data.updates.map((item) =>
        prisma.task.update({
          where: { id: item.id },
          data: { status: item.status, order: item.order },
        })
      )
    );

    revalidatePath(`/dashboard/projects/${data.projectId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("reorderTasks failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder tasks",
    };
  }
}

const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().optional().or(z.literal("")).nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
});

/** Minimal create for board seeding / Phase 2 parity. */
export async function createTask(input: z.infer<typeof createTaskSchema>) {
  const userId = await requireUserId();
  const data = createTaskSchema.parse(input);

  const project = await prisma.project.findFirst({
    where: { id: data.projectId, userId },
  });
  if (!project) {
    throw new Error("Project not found");
  }

  const status = data.status ?? TaskStatus.TODO;
  const order = await prisma.task.count({
    where: { projectId: data.projectId, status },
  });

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority ?? TaskPriority.MEDIUM,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status,
      order,
      projectId: data.projectId,
    },
  });

  revalidatePath(`/dashboard/projects/${data.projectId}`);
  revalidatePath("/dashboard");
  return task;
}

const createTasksSchema = z.object({
  projectId: z.string().min(1),
  titles: z.array(z.string().trim().min(1).max(200)).min(1).max(10),
  priority: z.nativeEnum(TaskPriority).optional(),
});

/** Batch-create tasks (Smart Break Down). */
export async function createTasks(
  input: z.infer<typeof createTasksSchema>
): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  try {
    const userId = await requireUserId();
    const data = createTasksSchema.parse(input);

    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId },
    });
    if (!project) {
      return { success: false, error: "Project not found" };
    }

    const status = TaskStatus.TODO;
    const baseOrder = await prisma.task.count({
      where: { projectId: data.projectId, status },
    });

    await prisma.task.createMany({
      data: data.titles.map((title, index) => ({
        title,
        status,
        priority: data.priority ?? TaskPriority.MEDIUM,
        order: baseOrder + index,
        projectId: data.projectId,
      })),
    });

    revalidatePath(`/dashboard/projects/${data.projectId}`);
    revalidatePath("/dashboard");
    return { success: true, count: data.titles.length };
  } catch (error) {
    console.error("createTasks failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tasks",
    };
  }
}

const updateTaskSchema = taskFormSchema.extend({
  taskId: z.string().min(1),
  status: z.nativeEnum(TaskStatus).optional(),
});

/** Full task update (title, description, priority, due date, status). */
export async function updateTask(
  input: z.infer<typeof updateTaskSchema>
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const userId = await requireUserId();
    const data = updateTaskSchema.parse(input);

    const task = await getOwnedTask(data.taskId, userId);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    await prisma.task.update({
      where: { id: task.id },
      data: {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        dueDate: data.dueDate
          ? new Date(
              data.dueDate.includes("T")
                ? data.dueDate
                : `${data.dueDate}T12:00:00`
            )
          : null,
        ...(data.status ? { status: data.status } : {}),
      },
    });

    revalidatePath(`/dashboard/projects/${task.projectId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("updateTask failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

export async function deleteTask(
  taskId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const userId = await requireUserId();
    const task = await getOwnedTask(taskId, userId);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    const projectId = task.projectId;
    await prisma.task.delete({ where: { id: task.id } });

    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("deleteTask failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}
