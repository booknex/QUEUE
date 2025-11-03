import { type ClientFile, type InsertClientFile, type UpdateClientFile, type WorkSession, type InsertWorkSession, type Pipeline, type InsertPipeline, type Opportunity, type InsertOpportunity, type UpdateOpportunity, type Contact, type InsertContact, clientFiles, workSessions, pipelines, opportunities, contacts } from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc, sql } from "drizzle-orm";

export interface IStorage {
  getAllFiles(): Promise<ClientFile[]>;
  getFile(id: number): Promise<ClientFile | undefined>;
  createFile(file: InsertClientFile): Promise<ClientFile>;
  updateFile(id: number, updates: UpdateClientFile): Promise<ClientFile | undefined>;
  deleteFile(id: number): Promise<boolean>;
  touchFile(id: number, notes?: string | null): Promise<ClientFile | undefined>;
  
  createWorkSession(session: InsertWorkSession): Promise<WorkSession>;
  getWorkSessionsByFile(fileId: number): Promise<WorkSession[]>;
  getAllWorkSessions(): Promise<WorkSession[]>;
  
  getAllPipelines(): Promise<Pipeline[]>;
  getPipeline(id: number): Promise<Pipeline | undefined>;
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  updatePipeline(id: number, updates: { name: string }): Promise<Pipeline | undefined>;
  deletePipeline(id: number): Promise<boolean>;

  getAllContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;

  getAllOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, updates: UpdateOpportunity): Promise<Opportunity | undefined>;
  deleteOpportunity(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllFiles(): Promise<ClientFile[]> {
    return await db.select().from(clientFiles).orderBy(
      sql`${clientFiles.lastTouchedAt} ASC NULLS FIRST`
    );
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

  async getAllPipelines(): Promise<Pipeline[]> {
    return await db
      .select()
      .from(pipelines)
      .orderBy(asc(pipelines.createdAt));
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

  async getAllContacts(): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .orderBy(asc(contacts.createdAt));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getAllOpportunities(): Promise<Opportunity[]> {
    return await db
      .select()
      .from(opportunities)
      .orderBy(asc(opportunities.createdAt));
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
}

export const storage = new DatabaseStorage();
