import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientFileSchema, updateClientFileSchema, touchFileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch file" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const validated = insertClientFileSchema.parse(req.body);
      const file = await storage.createFile(validated);
      res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  app.patch("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      const validated = updateClientFileSchema.parse(req.body);
      const file = await storage.updateFile(id, validated);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update file" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      const success = await storage.deleteFile(id);
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  app.post("/api/files/:id/touch", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      
      const validated = touchFileSchema.parse(req.body);
      
      const file = await storage.touchFile(id, validated.notes);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to touch file" });
    }
  });

  app.post("/api/files/reorder", async (req, res) => {
    try {
      const { files } = req.body;
      if (!Array.isArray(files)) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      const reorderedFiles = await storage.reorderFiles(files);
      res.json(reorderedFiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder files" });
    }
  });

  app.get("/api/files/:id/sessions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      const sessions = await storage.getWorkSessionsByFile(id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work sessions" });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllWorkSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work sessions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
