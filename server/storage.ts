import { type ClientFile, type InsertClientFile, type UpdateClientFile, clientFiles } from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  getAllFiles(): Promise<ClientFile[]>;
  getFile(id: number): Promise<ClientFile | undefined>;
  createFile(file: InsertClientFile): Promise<ClientFile>;
  updateFile(id: number, updates: UpdateClientFile): Promise<ClientFile | undefined>;
  deleteFile(id: number): Promise<boolean>;
  touchFile(id: number): Promise<ClientFile | undefined>;
  reorderFiles(files: ClientFile[]): Promise<ClientFile[]>;
}

export class DatabaseStorage implements IStorage {
  async getAllFiles(): Promise<ClientFile[]> {
    return await db.select().from(clientFiles).orderBy(asc(clientFiles.queuePosition));
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

  async touchFile(id: number): Promise<ClientFile | undefined> {
    const [file] = await db
      .update(clientFiles)
      .set({ lastTouchedAt: new Date() })
      .where(eq(clientFiles.id, id))
      .returning();
    return file || undefined;
  }

  async reorderFiles(files: ClientFile[]): Promise<ClientFile[]> {
    for (const file of files) {
      await db
        .update(clientFiles)
        .set({ queuePosition: file.queuePosition })
        .where(eq(clientFiles.id, file.id));
    }
    return files;
  }
}

export const storage = new DatabaseStorage();
