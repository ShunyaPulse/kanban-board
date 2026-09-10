import { z } from "zod";

// Core enums and primitives
export const PrioritySchema = z.enum(["low", "medium", "high", "critical"]);

// Entity schemas matching our actual DB/types structure
export const SubtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean(),
  cardId: z.string(),
  position: z.number().int().min(0),
});

export const CardSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  priority: PrioritySchema,
  columnId: z.string(),
  position: z.number().int().min(0),
  createdAt: z.string(),
  movedAt: z.string(),
  completedAt: z.string().nullable(),
});

export const CardWithSubtasksSchema = CardSchema.extend({
  subtasks: z.array(SubtaskSchema),
});

export const ColumnSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  position: z.number().int().min(0),
  wipLimit: z.number().int().min(0),
});

export const BoardDataSchema = z.object({
  columns: z.array(ColumnSchema),
  cards: z.array(CardWithSubtasksSchema),
  exportedAt: z.string(),
  version: z.string(),
});

// API request schemas
export const CreateCardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  columnId: z.string().min(1, "Column ID is required"),
  description: z.string().optional(),
  priority: PrioritySchema.optional(),
});

export const UpdateCardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: PrioritySchema.optional(),
});

export const MoveCardSchema = z.object({
  columnId: z.string().min(1),
  position: z.number().int().min(0),
});

export const CreateSubtaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const UpdateColumnSchema = z.object({
  title: z.string().min(1).optional(),
  wipLimit: z.number().int().min(0).optional(),
});

// Inferred types
export type CreateCard = z.infer<typeof CreateCardSchema>;
export type UpdateCard = z.infer<typeof UpdateCardSchema>;
export type MoveCard = z.infer<typeof MoveCardSchema>;
export type CreateSubtask = z.infer<typeof CreateSubtaskSchema>;
export type UpdateColumn = z.infer<typeof UpdateColumnSchema>;
