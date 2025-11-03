import { type ClientFile, type InsertClientFile, type UpdateClientFile, type WorkSession, type InsertWorkSession, clientFiles, workSessions } from "@shared/schema";
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
}

export class DatabaseStorage implements IStorage {
  async getAllFiles(): Promise<ClientFile[]> {
    return await db.select().from(clientFiles).orderBy(
      sql`CASE WHEN ${clientFiles.lastTouchedAt} IS NULL THEN 0 ELSE 1 END`,
      asc(clientFiles.lastTouchedAt)
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
}

export const storage = new DatabaseStorage();
