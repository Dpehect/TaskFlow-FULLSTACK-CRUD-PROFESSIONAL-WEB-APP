import { z } from "zod";
import { TaskPriority, TaskStatus } from "@prisma/client";

export const projectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(80, "Keep the name under 80 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Pick a valid color")
    .optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200, "Keep the title under 200 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional()
    .or(z.literal("")),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(TaskStatus).optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const editTaskFormSchema = taskFormSchema.extend({
  status: z.nativeEnum(TaskStatus),
});

export type EditTaskFormValues = z.infer<typeof editTaskFormSchema>;
