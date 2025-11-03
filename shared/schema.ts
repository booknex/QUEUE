import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clientFiles = pgTable("client_files", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("waiting"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastTouchedAt: timestamp("last_touched_at"),
  closedAt: timestamp("closed_at"),
});

export const workSessions = pgTable("work_sessions", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull().references(() => clientFiles.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  notes: text("notes"),
});

export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClientFileSchema = createInsertSchema(clientFiles).omit({
  id: true,
  createdAt: true,
});

export type InsertClientFile = z.infer<typeof insertClientFileSchema>;
export type ClientFile = typeof clientFiles.$inferSelect;

export const updateClientFileSchema = z.object({
  clientName: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["waiting", "in_progress", "completed"]).optional(),
  lastTouchedAt: z.date().optional(),
  closedAt: z.date().optional(),
});

export const closeFileSchema = z.object({
  closedAt: z.string().transform((str) => new Date(str)),
});

export type UpdateClientFile = z.infer<typeof updateClientFileSchema>;

export const insertWorkSessionSchema = createInsertSchema(workSessions).omit({
  id: true,
  startedAt: true,
});

export type InsertWorkSession = z.infer<typeof insertWorkSessionSchema>;
export type WorkSession = typeof workSessions.$inferSelect;

export const touchFileSchema = z.object({
  notes: z.string().optional(),
});

export const insertPipelineSchema = createInsertSchema(pipelines).omit({
  id: true,
  createdAt: true,
});

export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type Pipeline = typeof pipelines.$inferSelect;

export const updatePipelineSchema = z.object({
  name: z.string().min(1),
});
