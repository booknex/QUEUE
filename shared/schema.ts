import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isSuperAdmin: text("is_super_admin").notNull().default("false"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Junction table for user-company relationships (many-to-many)
// Role can be 'owner' or 'member'
export const userCompanies = pgTable("user_companies", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  role: varchar("role").notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserCompanySchema = createInsertSchema(userCompanies).omit({
  createdAt: true,
});

export const updateUserCompanySchema = z.object({
  role: z.enum(["owner", "admin", "member"]),
});

export type InsertUserCompany = z.infer<typeof insertUserCompanySchema>;
export type UserCompany = typeof userCompanies.$inferSelect;
export type UpdateUserCompany = z.infer<typeof updateUserCompanySchema>;

// Enriched type for user with company membership info
export type UserWithRole = User & {
  role: string;
  memberSince: Date;
};

export const clientFiles = pgTable("client_files", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("APP-INTAKE"),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  pipelineId: integer("pipeline_id").references(() => pipelines.id, { onDelete: "set null" }),
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

export const meetingNotes = pgTable("meeting_notes", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull().references(() => clientFiles.id, { onDelete: "cascade" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const kanbanColumns = pgTable("kanban_columns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: integer("position").notNull().default(0),
  pipelineId: integer("pipeline_id").references(() => pipelines.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  columnId: integer("column_id").notNull().references(() => kanbanColumns.id, { onDelete: "cascade" }),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClientFileSchema = createInsertSchema(clientFiles).omit({
  id: true,
  createdAt: true,
});

export type InsertClientFile = z.infer<typeof insertClientFileSchema>;
export type ClientFile = typeof clientFiles.$inferSelect & {
  touchCount?: number;
};

export const updateClientFileSchema = z.object({
  clientName: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().min(1).optional(),
  pipelineId: z.number().nullable().optional(),
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

export const insertMeetingNoteSchema = createInsertSchema(meetingNotes).omit({
  id: true,
  createdAt: true,
});

export type InsertMeetingNote = z.infer<typeof insertMeetingNoteSchema>;
export type MeetingNote = typeof meetingNotes.$inferSelect;

export const insertPipelineSchema = createInsertSchema(pipelines).omit({
  id: true,
  createdAt: true,
});

export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type Pipeline = typeof pipelines.$inferSelect;

export const updatePipelineSchema = z.object({
  name: z.string().min(1),
});

export const insertKanbanColumnSchema = createInsertSchema(kanbanColumns).omit({
  id: true,
  createdAt: true,
});

export type InsertKanbanColumn = z.infer<typeof insertKanbanColumnSchema>;
export type KanbanColumn = typeof kanbanColumns.$inferSelect;

export const updateKanbanColumnSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.number().optional(),
});

export type UpdateKanbanColumn = z.infer<typeof updateKanbanColumnSchema>;

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export const updateContactSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().nullable().optional().transform(v => {
    if (v === null) return null;
    if (!v || !v.trim()) return null;
    return v.trim();
  }),
  email: z.string().email("Invalid email address").nullable().optional().or(z.literal("")).transform(v => {
    if (v === null) return null;
    if (!v || !v.trim()) return null;
    return v.trim();
  }),
});

export type UpdateContact = z.infer<typeof updateContactSchema>;

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "Title is required"),
});

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;

export type OpportunityWithContact = Opportunity & {
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  columnName: string;
};

export const updateOpportunitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  columnId: z.number().optional(),
  position: z.number().optional(),
});

export type UpdateOpportunity = z.infer<typeof updateOpportunitySchema>;

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Company name is required"),
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export const updateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
});

export type UpdateCompany = z.infer<typeof updateCompanySchema>;

export const statusFilters = pgTable("status_filters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  isSystem: integer("is_system").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStatusFilterSchema = createInsertSchema(statusFilters).omit({
  id: true,
  createdAt: true,
  isSystem: true,
});

export type InsertStatusFilter = z.infer<typeof insertStatusFilterSchema>;
export type StatusFilter = typeof statusFilters.$inferSelect;

export const updateStatusFilterSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.number().optional(),
});

export type UpdateStatusFilter = z.infer<typeof updateStatusFilterSchema>;
