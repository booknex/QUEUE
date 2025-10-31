import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clientFiles = pgTable("client_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("waiting"),
  queuePosition: integer("queue_position").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastTouchedAt: timestamp("last_touched_at"),
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
  queuePosition: z.number().int().optional(),
  lastTouchedAt: z.date().optional(),
});

export type UpdateClientFile = z.infer<typeof updateClientFileSchema>;
