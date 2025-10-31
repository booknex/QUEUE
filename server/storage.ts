import { type ClientFile, type InsertClientFile, type UpdateClientFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllFiles(): Promise<ClientFile[]>;
  getFile(id: string): Promise<ClientFile | undefined>;
  createFile(file: InsertClientFile): Promise<ClientFile>;
  updateFile(id: string, updates: UpdateClientFile): Promise<ClientFile | undefined>;
  deleteFile(id: string): Promise<boolean>;
  touchFile(id: string): Promise<ClientFile | undefined>;
  reorderFiles(files: ClientFile[]): Promise<ClientFile[]>;
}

export class MemStorage implements IStorage {
  private files: Map<string, ClientFile>;

  constructor() {
    this.files = new Map();
  }

  async getAllFiles(): Promise<ClientFile[]> {
    return Array.from(this.files.values()).sort((a, b) => a.queuePosition - b.queuePosition);
  }

  async getFile(id: string): Promise<ClientFile | undefined> {
    return this.files.get(id);
  }

  async createFile(insertFile: InsertClientFile): Promise<ClientFile> {
    const id = randomUUID();
    const now = new Date();
    const file: ClientFile = {
      id,
      clientName: insertFile.clientName,
      description: insertFile.description || null,
      status: insertFile.status || "waiting",
      queuePosition: insertFile.queuePosition,
      createdAt: now,
      lastTouchedAt: null,
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: string, updates: UpdateClientFile): Promise<ClientFile | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;

    const updatedFile: ClientFile = {
      ...file,
      ...updates,
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }

  async touchFile(id: string): Promise<ClientFile | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;

    const updatedFile: ClientFile = {
      ...file,
      lastTouchedAt: new Date(),
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async reorderFiles(files: ClientFile[]): Promise<ClientFile[]> {
    files.forEach(file => {
      this.files.set(file.id, file);
    });
    return files;
  }
}

export const storage = new MemStorage();
