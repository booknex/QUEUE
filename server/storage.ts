import { type ClientFile, type InsertClientFile, type UpdateClientFile, type WorkSession, type InsertWorkSession, type MeetingNote, type InsertMeetingNote, type Pipeline, type InsertPipeline, type Opportunity, type OpportunityWithContact, type InsertOpportunity, type UpdateOpportunity, type Contact, type InsertContact, type UpdateContact, type KanbanColumn, type InsertKanbanColumn, type UpdateKanbanColumn, type Company, type InsertCompany, type UpdateCompany, type StatusFilter, type InsertStatusFilter, type UpdateStatusFilter, type User, type UpsertUser, type UserWithRole, type InsertUserCompany, clientFiles, workSessions, meetingNotes, pipelines, opportunities, contacts, kanbanColumns, companies, statusFilters, users, userCompanies } from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc, sql, isNull, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserCompanies(userId: string): Promise<number[]>;
  addUserToCompany(userId: string, companyId: number, role: string): Promise<void>;
  getUsersByCompany(companyId: number): Promise<UserWithRole[]>;
  updateUserRole(userId: string, companyId: number, role: string): Promise<void>;
  removeUserFromCompany(userId: string, companyId: number): Promise<void>;
  getUserRole(userId: string, companyId: number): Promise<string | undefined>;

  getAllCompanies(userId?: string): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany, userId?: string): Promise<Company>;
  updateCompany(id: number, updates: UpdateCompany): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;

  getAllFiles(companyId?: number): Promise<ClientFile[]>;
  getFile(id: number): Promise<ClientFile | undefined>;
  createFile(file: InsertClientFile): Promise<ClientFile>;
  updateFile(id: number, updates: UpdateClientFile): Promise<ClientFile | undefined>;
  deleteFile(id: number): Promise<boolean>;
  touchFile(id: number, notes?: string | null): Promise<ClientFile | undefined>;
  
  createWorkSession(session: InsertWorkSession): Promise<WorkSession>;
  getWorkSessionsByFile(fileId: number): Promise<WorkSession[]>;
  getAllWorkSessions(): Promise<WorkSession[]>;
  deleteWorkSession(id: number): Promise<boolean>;

  createMeetingNote(note: InsertMeetingNote): Promise<MeetingNote>;
  getMeetingNotesByFile(fileId: number): Promise<MeetingNote[]>;
  deleteMeetingNote(id: number): Promise<boolean>;
  
  getAllPipelines(companyId?: number): Promise<Pipeline[]>;
  getPipeline(id: number): Promise<Pipeline | undefined>;
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  updatePipeline(id: number, updates: { name: string }): Promise<Pipeline | undefined>;
  deletePipeline(id: number): Promise<boolean>;

  getAllKanbanColumns(pipelineId?: number | null): Promise<KanbanColumn[]>;
  getKanbanColumn(id: number): Promise<KanbanColumn | undefined>;
  createKanbanColumn(column: InsertKanbanColumn): Promise<KanbanColumn>;
  updateKanbanColumn(id: number, updates: UpdateKanbanColumn): Promise<KanbanColumn | undefined>;
  deleteKanbanColumn(id: number): Promise<boolean>;

  getAllContacts(companyId?: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  findDuplicateContact(companyId: number, name: string, email?: string | null, phone?: string | null): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, updates: UpdateContact): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;

  getAllOpportunities(): Promise<OpportunityWithContact[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, updates: UpdateOpportunity): Promise<Opportunity | undefined>;
  deleteOpportunity(id: number): Promise<boolean>;

  getAllFilters(companyId?: number): Promise<StatusFilter[]>;
  getFilter(id: number): Promise<StatusFilter | undefined>;
  createFilter(filter: InsertStatusFilter): Promise<StatusFilter>;
  updateFilter(id: number, updates: UpdateStatusFilter): Promise<StatusFilter | undefined>;
  deleteFilter(id: number): Promise<boolean>;
  reorderFilters(filterIds: number[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserCompanies(userId: string): Promise<number[]> {
    const results = await db
      .select({ companyId: userCompanies.companyId })
      .from(userCompanies)
      .where(eq(userCompanies.userId, userId));
    return results.map(r => r.companyId);
  }

  async addUserToCompany(userId: string, companyId: number, role: string): Promise<void> {
    await db.insert(userCompanies).values({
      userId,
      companyId,
      role,
    });
  }

  async ensureUserHasDefaultCompany(userId: string, firstName?: string, lastName?: string): Promise<Company> {
    const existingCompanies = await this.getUserCompanies(userId);
    
    if (existingCompanies.length > 0) {
      const [company] = await db.select().from(companies).where(eq(companies.id, existingCompanies[0]));
      return company;
    }

    const displayName = firstName || "My";
    let companyName = `${displayName}'s Company`;
    let attempt = 0;
    let company: Company | undefined;

    while (!company && attempt < 10) {
      const tryName = attempt === 0 ? companyName : `${companyName} ${attempt}`;
      try {
        const [newCompany] = await db.insert(companies).values({
          name: tryName,
        }).returning();
        
        await db.insert(userCompanies).values({
          userId,
          companyId: newCompany.id,
          role: "owner",
        });
        
        company = newCompany;
      } catch (error) {
        attempt++;
      }
    }

    if (!company) {
      throw new Error("Failed to create default company after multiple attempts");
    }

    return company;
  }

  async getUsersByCompany(companyId: number): Promise<UserWithRole[]> {
    const results = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: userCompanies.role,
        memberSince: userCompanies.createdAt,
      })
      .from(users)
      .innerJoin(userCompanies, eq(users.id, userCompanies.userId))
      .where(eq(userCompanies.companyId, companyId));
    
    return results;
  }

  async getUserRole(userId: string, companyId: number): Promise<string | undefined> {
    const [result] = await db
      .select({ role: userCompanies.role })
      .from(userCompanies)
      .where(and(
        eq(userCompanies.userId, userId),
        eq(userCompanies.companyId, companyId)
      ));
    return result?.role;
  }

  async updateUserRole(userId: string, companyId: number, role: string): Promise<void> {
    await db
      .update(userCompanies)
      .set({ role })
      .where(and(
        eq(userCompanies.userId, userId),
        eq(userCompanies.companyId, companyId)
      ));
  }

  async removeUserFromCompany(userId: string, companyId: number): Promise<void> {
    await db
      .delete(userCompanies)
      .where(and(
        eq(userCompanies.userId, userId),
        eq(userCompanies.companyId, companyId)
      ));
  }

  async getAllCompanies(userId?: string): Promise<Company[]> {
    if (userId) {
      // Filter companies by user access
      const results = await db
        .select({
          id: companies.id,
          name: companies.name,
          createdAt: companies.createdAt,
        })
        .from(companies)
        .innerJoin(userCompanies, eq(companies.id, userCompanies.companyId))
        .where(eq(userCompanies.userId, userId))
        .orderBy(asc(companies.name));
      return results;
    }
    return await db.select().from(companies).orderBy(asc(companies.name));
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany, userId?: string): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    
    // Auto-link creator as owner
    if (userId) {
      await this.addUserToCompany(userId, company.id, 'owner');
    }
    
    return company;
  }

  async updateCompany(id: number, updates: UpdateCompany): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set(updates)
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id)).returning();
    return result.length > 0;
  }

  async getAllFiles(companyId?: number): Promise<ClientFile[]> {
    const query = db
      .select({
        id: clientFiles.id,
        clientName: clientFiles.clientName,
        description: clientFiles.description,
        status: clientFiles.status,
        companyId: clientFiles.companyId,
        pipelineId: clientFiles.pipelineId,
        createdAt: clientFiles.createdAt,
        lastTouchedAt: clientFiles.lastTouchedAt,
        closedAt: clientFiles.closedAt,
        touchCount: sql<number>`CAST(COUNT(${workSessions.id}) AS INTEGER)`,
      })
      .from(clientFiles)
      .leftJoin(workSessions, eq(clientFiles.id, workSessions.fileId))
      .groupBy(clientFiles.id)
      .orderBy(sql`${clientFiles.lastTouchedAt} ASC NULLS FIRST`);
    
    if (companyId !== undefined) {
      query.where(eq(clientFiles.companyId, companyId));
    }
    
    return await query;
  }

  async getFile(id: number): Promise<ClientFile | undefined> {
    const [file] = await db.select().from(clientFiles).where(eq(clientFiles.id, id));
    return file || undefined;
  }

  async createFile(insertFile: InsertClientFile): Promise<ClientFile> {
    const [file] = await db
      .insert(clientFiles)
      .values(insertFile)
      .returning();
    return file;
  }

  async updateFile(id: number, updates: UpdateClientFile): Promise<ClientFile | undefined> {
    const [file] = await db
      .update(clientFiles)
      .set(updates)
      .where(eq(clientFiles.id, id))
      .returning();
    return file || undefined;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db
      .delete(clientFiles)
      .where(eq(clientFiles.id, id))
      .returning();
    return result.length > 0;
  }

  async touchFile(id: number, notes?: string | null): Promise<ClientFile | undefined> {
    return await db.transaction(async (tx) => {
      const [file] = await tx
        .update(clientFiles)
        .set({ 
          lastTouchedAt: new Date()
        })
        .where(eq(clientFiles.id, id))
        .returning();
      
      if (!file) {
        return undefined;
      }
      
      await tx
        .insert(workSessions)
        .values({ fileId: id, notes: notes || null });
      
      return file;
    });
  }

  async createWorkSession(insertSession: InsertWorkSession): Promise<WorkSession> {
    const [session] = await db
      .insert(workSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getWorkSessionsByFile(fileId: number): Promise<WorkSession[]> {
    return await db
      .select()
      .from(workSessions)
      .where(eq(workSessions.fileId, fileId))
      .orderBy(desc(workSessions.startedAt));
  }

  async getAllWorkSessions(): Promise<WorkSession[]> {
    return await db
      .select()
      .from(workSessions)
      .orderBy(desc(workSessions.startedAt));
  }

  async deleteWorkSession(id: number): Promise<boolean> {
    const result = await db
      .delete(workSessions)
      .where(eq(workSessions.id, id))
      .returning();
    return result.length > 0;
  }

  async createMeetingNote(insertNote: InsertMeetingNote): Promise<MeetingNote> {
    const [note] = await db
      .insert(meetingNotes)
      .values(insertNote)
      .returning();
    return note;
  }

  async getMeetingNotesByFile(fileId: number): Promise<MeetingNote[]> {
    return await db
      .select()
      .from(meetingNotes)
      .where(eq(meetingNotes.fileId, fileId))
      .orderBy(desc(meetingNotes.createdAt));
  }

  async deleteMeetingNote(id: number): Promise<boolean> {
    const result = await db
      .delete(meetingNotes)
      .where(eq(meetingNotes.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllPipelines(companyId?: number): Promise<Pipeline[]> {
    const query = db.select().from(pipelines).orderBy(asc(pipelines.createdAt));
    
    if (companyId !== undefined) {
      query.where(eq(pipelines.companyId, companyId));
    }
    
    return await query;
  }

  async getPipeline(id: number): Promise<Pipeline | undefined> {
    const [pipeline] = await db.select().from(pipelines).where(eq(pipelines.id, id));
    return pipeline || undefined;
  }

  async createPipeline(insertPipeline: InsertPipeline): Promise<Pipeline> {
    const [pipeline] = await db
      .insert(pipelines)
      .values(insertPipeline)
      .returning();
    return pipeline;
  }

  async updatePipeline(id: number, updates: { name: string }): Promise<Pipeline | undefined> {
    const [pipeline] = await db
      .update(pipelines)
      .set(updates)
      .where(eq(pipelines.id, id))
      .returning();
    return pipeline || undefined;
  }

  async deletePipeline(id: number): Promise<boolean> {
    const result = await db
      .delete(pipelines)
      .where(eq(pipelines.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllContacts(companyId?: number): Promise<Contact[]> {
    const query = db.select().from(contacts).orderBy(asc(contacts.createdAt));
    
    if (companyId !== undefined) {
      query.where(eq(contacts.companyId, companyId));
    }
    
    return await query;
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async findDuplicateContact(companyId: number, name: string, email?: string | null, phone?: string | null): Promise<Contact | undefined> {
    // Check for duplicate by name within the same company
    const [nameMatch] = await db
      .select()
      .from(contacts)
      .where(and(
        eq(contacts.companyId, companyId),
        eq(contacts.name, name)
      ));
    
    if (nameMatch) {
      return nameMatch;
    }
    
    // Check for duplicate by email if email is provided
    if (email && email.trim()) {
      const [emailMatch] = await db
        .select()
        .from(contacts)
        .where(and(
          eq(contacts.companyId, companyId),
          eq(contacts.email, email)
        ));
      
      if (emailMatch) {
        return emailMatch;
      }
    }
    
    // Check for duplicate by phone if phone is provided
    if (phone && phone.trim()) {
      const [phoneMatch] = await db
        .select()
        .from(contacts)
        .where(and(
          eq(contacts.companyId, companyId),
          eq(contacts.phone, phone)
        ));
      
      if (phoneMatch) {
        return phoneMatch;
      }
    }
    
    return undefined;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async updateContact(id: number, updates: UpdateContact): Promise<Contact | undefined> {
    const [contact] = await db
      .update(contacts)
      .set(updates)
      .where(eq(contacts.id, id))
      .returning();
    return contact || undefined;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db
      .delete(contacts)
      .where(eq(contacts.id, id));
    return true;
  }

  async getAllKanbanColumns(pipelineId?: number | null): Promise<KanbanColumn[]> {
    const whereClause = pipelineId === undefined 
      ? isNull(kanbanColumns.pipelineId)
      : pipelineId === null 
        ? isNull(kanbanColumns.pipelineId)
        : eq(kanbanColumns.pipelineId, pipelineId);
    
    return await db
      .select()
      .from(kanbanColumns)
      .where(whereClause)
      .orderBy(asc(kanbanColumns.position));
  }

  async getKanbanColumn(id: number): Promise<KanbanColumn | undefined> {
    const [column] = await db.select().from(kanbanColumns).where(eq(kanbanColumns.id, id));
    return column || undefined;
  }

  async createKanbanColumn(insertColumn: InsertKanbanColumn): Promise<KanbanColumn> {
    const [column] = await db
      .insert(kanbanColumns)
      .values(insertColumn)
      .returning();
    return column;
  }

  async updateKanbanColumn(id: number, updates: UpdateKanbanColumn): Promise<KanbanColumn | undefined> {
    const [column] = await db
      .update(kanbanColumns)
      .set(updates)
      .where(eq(kanbanColumns.id, id))
      .returning();
    return column || undefined;
  }

  async deleteKanbanColumn(id: number): Promise<boolean> {
    const result = await db
      .delete(kanbanColumns)
      .where(eq(kanbanColumns.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllOpportunities(): Promise<OpportunityWithContact[]> {
    const results = await db
      .select({
        id: opportunities.id,
        title: opportunities.title,
        description: opportunities.description,
        columnId: opportunities.columnId,
        contactId: opportunities.contactId,
        position: opportunities.position,
        createdAt: opportunities.createdAt,
        contactName: contacts.name,
        contactPhone: contacts.phone,
        contactEmail: contacts.email,
        columnName: kanbanColumns.name,
      })
      .from(opportunities)
      .leftJoin(contacts, eq(opportunities.contactId, contacts.id))
      .leftJoin(kanbanColumns, eq(opportunities.columnId, kanbanColumns.id))
      .orderBy(asc(opportunities.createdAt));
    
    return results.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      columnId: row.columnId,
      contactId: row.contactId,
      position: row.position,
      createdAt: row.createdAt,
      contactName: row.contactName || "Unknown Contact",
      contactPhone: row.contactPhone || null,
      contactEmail: row.contactEmail || null,
      columnName: row.columnName || "Unknown Column",
    }));
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity || undefined;
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const [opportunity] = await db
      .insert(opportunities)
      .values(insertOpportunity)
      .returning();
    return opportunity;
  }

  async updateOpportunity(id: number, updates: UpdateOpportunity): Promise<Opportunity | undefined> {
    const [opportunity] = await db
      .update(opportunities)
      .set(updates)
      .where(eq(opportunities.id, id))
      .returning();
    return opportunity || undefined;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    const result = await db
      .delete(opportunities)
      .where(eq(opportunities.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllFilters(companyId?: number): Promise<StatusFilter[]> {
    if (companyId !== undefined) {
      return await db
        .select()
        .from(statusFilters)
        .where(eq(statusFilters.companyId, companyId))
        .orderBy(asc(statusFilters.position));
    }
    
    return await db.select().from(statusFilters).orderBy(asc(statusFilters.position));
  }

  async getFilter(id: number): Promise<StatusFilter | undefined> {
    const [filter] = await db.select().from(statusFilters).where(eq(statusFilters.id, id));
    return filter || undefined;
  }

  async createFilter(insertFilter: InsertStatusFilter): Promise<StatusFilter> {
    const maxPositionResult = await db
      .select({ maxPosition: sql<number>`COALESCE(MAX(${statusFilters.position}), -1)` })
      .from(statusFilters)
      .where(eq(statusFilters.companyId, insertFilter.companyId));
    
    const nextPosition = (maxPositionResult[0]?.maxPosition ?? -1) + 1;
    
    const [filter] = await db
      .insert(statusFilters)
      .values({
        ...insertFilter,
        position: nextPosition,
        isSystem: 0,
      })
      .returning();
    return filter;
  }

  async updateFilter(id: number, updates: UpdateStatusFilter): Promise<StatusFilter | undefined> {
    return await db.transaction(async (tx) => {
      const [existingFilter] = await tx
        .select()
        .from(statusFilters)
        .where(eq(statusFilters.id, id));
      
      if (!existingFilter) {
        return undefined;
      }
      
      const [filter] = await tx
        .update(statusFilters)
        .set(updates)
        .where(eq(statusFilters.id, id))
        .returning();
      
      if (updates.name && existingFilter.name !== updates.name) {
        await tx
          .update(clientFiles)
          .set({ status: updates.name })
          .where(and(
            eq(clientFiles.companyId, existingFilter.companyId),
            eq(clientFiles.status, existingFilter.name)
          ));
      }
      
      return filter || undefined;
    });
  }

  async deleteFilter(id: number): Promise<boolean> {
    const [filter] = await db
      .select()
      .from(statusFilters)
      .where(eq(statusFilters.id, id));
    
    if (!filter) {
      return false;
    }
    
    const result = await db
      .delete(statusFilters)
      .where(eq(statusFilters.id, id))
      .returning();
    return result.length > 0;
  }

  async reorderFilters(filterIds: number[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (let i = 0; i < filterIds.length; i++) {
        await tx
          .update(statusFilters)
          .set({ position: i })
          .where(eq(statusFilters.id, filterIds[i]));
      }
    });
  }
}

export const storage = new DatabaseStorage();
