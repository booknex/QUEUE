import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientFileSchema, updateClientFileSchema, touchFileSchema, closeFileSchema, insertPipelineSchema, updatePipelineSchema, insertKanbanColumnSchema, updateKanbanColumnSchema, insertContactSchema, updateContactSchema, insertOpportunitySchema, updateOpportunitySchema, insertCompanySchema, updateCompanySchema, insertStatusFilterSchema, updateStatusFilterSchema, updateUserCompanySchema, updateUserProfileSchema, updateUserPasswordSchema } from "@shared/schema";
import { z } from "zod";
import type { ClientFile, WorkSession, MeetingNote, Pipeline, KanbanColumn, Contact, Opportunity, OpportunityWithContact, Company, StatusFilter } from "@shared/schema";
import { broadcast } from "./websocket";
import twilio from "twilio";
import { setupAuth, hashPassword } from "./auth";

// Middleware to check if user is authenticated
const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

function serializeFile(file: ClientFile) {
  return {
    ...file,
    createdAt: file.createdAt.toISOString(),
    lastTouchedAt: file.lastTouchedAt ? file.lastTouchedAt.toISOString() : null,
    closedAt: file.closedAt ? file.closedAt.toISOString() : null,
  };
}

function serializeSession(session: WorkSession) {
  return {
    ...session,
    startedAt: session.startedAt.toISOString(),
  };
}

function serializeMeetingNote(note: MeetingNote) {
  return {
    ...note,
    createdAt: note.createdAt.toISOString(),
  };
}

function serializeCompany(company: Company) {
  return {
    ...company,
    createdAt: company.createdAt.toISOString(),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware (sets up /api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Get all users in the system (unrestricted access)
  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      // Remove password from response
      const sanitizedUsers = allUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Company user management routes (any authenticated user can manage any company)
  app.get("/api/company-users", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      
      if (!companyId) {
        return res.status(400).json({ error: "companyId is required" });
      }
      
      // Unrestricted access - any authenticated user can view users for any company
      const users = await storage.getUsersByCompany(companyId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company users" });
    }
  });

  app.post("/api/company-users", isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        companyId: z.number(),
        email: z.string().min(1, "Email or username is required"),
        role: z.enum(["owner", "admin", "member"]).default("member"),
      });
      
      const validated = schema.parse(req.body);
      const { companyId, email, role } = validated;
      
      // Find user by email or username
      let targetUser = await storage.getUserByEmail(email);
      if (!targetUser) {
        targetUser = await storage.getUserByUsername(email);
      }
      
      if (!targetUser) {
        return res.status(404).json({ error: "User not found. They must log in to the application first." });
      }
      
      // Check if user is already a member
      const existingRole = await storage.getUserRole(targetUser.id, companyId);
      if (existingRole) {
        return res.status(400).json({ error: "User is already a member of this company" });
      }
      
      // Add user to company
      await storage.addUserToCompany(targetUser.id, companyId, role);
      
      res.status(201).json({ success: true, userId: targetUser.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add user to company" });
    }
  });

  app.patch("/api/company-users/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.userId;
      
      if (!targetUserId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      // Validate request body with schema
      const schema = updateUserCompanySchema.extend({
        companyId: z.number(),
      });
      const validated = schema.parse(req.body);
      const { role, companyId } = validated;
      
      // Check if demoting the last owner
      if (role !== 'owner') {
        const targetUserCurrentRole = await storage.getUserRole(targetUserId, companyId);
        if (targetUserCurrentRole === 'owner') {
          const allUsers = await storage.getUsersByCompany(companyId);
          const ownerCount = allUsers.filter(u => u.role === 'owner').length;
          if (ownerCount <= 1) {
            return res.status(400).json({ error: "Cannot demote the last owner. Promote another user to owner first." });
          }
        }
      }
      
      await storage.updateUserRole(targetUserId, companyId, role);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  app.delete("/api/company-users/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.userId;
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      
      if (!targetUserId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      if (!companyId) {
        return res.status(400).json({ error: "companyId is required" });
      }
      
      // Check if removing the last owner
      const targetUserRole = await storage.getUserRole(targetUserId, companyId);
      if (targetUserRole === 'owner') {
        const allUsers = await storage.getUsersByCompany(companyId);
        const ownerCount = allUsers.filter(u => u.role === 'owner').length;
        if (ownerCount <= 1) {
          return res.status(400).json({ error: "Cannot remove the last owner. Promote another user to owner first." });
        }
      }
      
      await storage.removeUserFromCompany(targetUserId, companyId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove user from company" });
    }
  });

  // Update user profile (any authenticated user can edit any user)
  app.patch("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.id;
      
      // Validate request body
      const validated = updateUserProfileSchema.parse(req.body);
      
      // Update user profile
      const updated = await storage.updateUserProfile(targetUserId, validated);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Reset user password (any authenticated user can change any password)
  app.post("/api/users/:id/password", isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.id;
      
      // Validate request body
      const validated = updateUserPasswordSchema.parse(req.body);
      
      // Hash the new password
      const hashedPassword = await hashPassword(validated.newPassword);
      
      // Update user password
      const updated = await storage.updateUserPassword(targetUserId, hashedPassword);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Delete user (any authenticated user can delete any account)
  app.delete("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.id;
      
      // Delete user
      const deleted = await storage.deleteUser(targetUserId);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Get companies for a specific user (any authenticated user can view)
  app.get("/api/users/:userId/companies", isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.userId;
      
      // Check if target user exists
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: "Resource not found" });
      }
      
      // Get target user's company IDs
      const targetUserCompanyIds = await storage.getUserCompanies(targetUserId);
      res.json(targetUserCompanyIds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user companies" });
    }
  });

  // Company routes (any authenticated user can view all companies)
  app.get("/api/companies", isAuthenticated, async (req: any, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies.map(serializeCompany));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid company ID" });
      }
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(serializeCompany(company));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validated = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validated, userId);
      broadcast({ type: "company:created", companyId: company.id });
      res.status(201).json(serializeCompany(company));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  app.patch("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid company ID" });
      }
      const validated = updateCompanySchema.parse(req.body);
      const company = await storage.updateCompany(id, validated);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      broadcast({ type: "company:updated", companyId: company.id });
      res.json(serializeCompany(company));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid company ID" });
      }
      const deleted = await storage.deleteCompany(id);
      if (!deleted) {
        return res.status(404).json({ error: "Company not found" });
      }
      broadcast({ type: "company:deleted", companyId: id });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete company" });
    }
  });

  // Status filter routes
  app.get("/api/filters", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const filters = await storage.getAllFilters(companyId);
      res.json(filters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch filters" });
    }
  });

  app.post("/api/filters", isAuthenticated, async (req, res) => {
    try {
      const validated = insertStatusFilterSchema.parse(req.body);
      const filter = await storage.createFilter(validated);
      broadcast({ type: "filter:created", companyId: filter.companyId });
      res.status(201).json(filter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create filter" });
    }
  });

  app.patch("/api/filters/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid filter ID" });
      }
      const validated = updateStatusFilterSchema.parse(req.body);
      const filter = await storage.updateFilter(id, validated);
      if (!filter) {
        return res.status(404).json({ error: "Filter not found" });
      }
      broadcast({ type: "filter:updated", companyId: filter.companyId });
      res.json(filter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      if (error instanceof Error && error.message === "Cannot update system filters") {
        return res.status(403).json({ error: "Cannot update system filters" });
      }
      res.status(500).json({ error: "Failed to update filter" });
    }
  });

  app.delete("/api/filters/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid filter ID" });
      }
      const filter = await storage.getFilter(id);
      if (!filter) {
        return res.status(404).json({ error: "Filter not found" });
      }
      await storage.deleteFilter(id);
      broadcast({ type: "filter:deleted", companyId: filter.companyId });
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Cannot delete system filters") {
        return res.status(403).json({ error: "Cannot delete system filters" });
      }
      res.status(500).json({ error: "Failed to delete filter" });
    }
  });

  app.post("/api/filters/reorder", isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        filterIds: z.array(z.number()),
        companyId: z.number(),
      });
      const validated = schema.parse(req.body);
      
      await storage.reorderFilters(validated.filterIds);
      broadcast({ type: "filter:updated", companyId: validated.companyId });
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to reorder filters" });
    }
  });

  // File routes
  app.get("/api/files", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const files = await storage.getAllFiles(companyId);
      res.json(files.map(serializeFile));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.get("/api/files/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(serializeFile(file));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch file" });
    }
  });

  app.post("/api/files", isAuthenticated, async (req, res) => {
    try {
      const validated = insertClientFileSchema.parse(req.body);
      const file = await storage.createFile(validated);
      broadcast({ type: "file:created", companyId: file.companyId });
      res.status(201).json(serializeFile(file));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  app.patch("/api/files/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      const validated = updateClientFileSchema.parse(req.body);
      
      // Get current file to check if description changed
      const currentFile = await storage.getFile(id);
      if (!currentFile) {
        return res.status(404).json({ error: "File not found" });
      }
      
      // If description is being updated and it changed, save it as a meeting note
      if (validated.description !== undefined && 
          validated.description !== null && 
          validated.description.trim() !== "" &&
          validated.description !== currentFile.description) {
        await storage.createMeetingNote({
          fileId: id,
          notes: validated.description,
        });
      }
      
      const file = await storage.updateFile(id, validated);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      broadcast({ type: "file:updated", companyId: file.companyId });
      res.json(serializeFile(file));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update file" });
    }
  });

  app.delete("/api/files/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      const file = await storage.getFile(id);
      const success = await storage.deleteFile(id);
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      if (file) {
        broadcast({ type: "file:deleted", companyId: file.companyId });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  app.post("/api/files/:id/touch", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      
      const validated = touchFileSchema.parse(req.body);
      
      if (!req.user?.id) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const file = await storage.touchFile(id, req.user.id, validated.notes);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      broadcast({ type: "file:touched", companyId: file.companyId });
      res.json(serializeFile(file));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to touch file" });
    }
  });

  app.post("/api/files/:id/close", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      
      const validated = closeFileSchema.parse(req.body);
      
      const file = await storage.updateFile(id, { 
        closedAt: validated.closedAt,
        status: "completed"
      });
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      broadcast({ type: "file:closed", companyId: file.companyId });
      res.json(serializeFile(file));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to close file" });
    }
  });

  app.get("/api/files/:id/sessions", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      const sessions = await storage.getWorkSessionsByFile(id);
      res.json(sessions.map(serializeSession));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work sessions" });
    }
  });

  app.delete("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      const success = await storage.deleteWorkSession(id);
      if (!success) {
        return res.status(404).json({ error: "Work session not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete work session" });
    }
  });

  app.get("/api/files/:id/meeting-notes", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      const notes = await storage.getMeetingNotesByFile(id);
      res.json(notes.map(serializeMeetingNote));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meeting notes" });
    }
  });

  app.delete("/api/meeting-notes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid meeting note ID" });
      }
      const success = await storage.deleteMeetingNote(id);
      if (!success) {
        return res.status(404).json({ error: "Meeting note not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meeting note" });
    }
  });

  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      const fileId = req.query.fileId ? parseInt(req.query.fileId as string) : undefined;
      const sessions = fileId 
        ? await storage.getWorkSessionsByFile(fileId)
        : await storage.getAllWorkSessions();
      res.json(sessions.map(serializeSession));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work sessions" });
    }
  });

  app.get("/api/pipelines", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const pipelines = await storage.getAllPipelines(companyId);
      res.json(pipelines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pipelines" });
    }
  });

  app.get("/api/pipelines/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid pipeline ID" });
      }
      const pipeline = await storage.getPipeline(id);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      res.json(pipeline);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pipeline" });
    }
  });

  app.post("/api/pipelines", isAuthenticated, async (req, res) => {
    try {
      const validated = insertPipelineSchema.parse(req.body);
      const pipeline = await storage.createPipeline(validated);
      broadcast({ type: "pipeline:created", companyId: pipeline.companyId });
      res.status(201).json(pipeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create pipeline" });
    }
  });

  app.patch("/api/pipelines/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid pipeline ID" });
      }
      const validated = updatePipelineSchema.parse(req.body);
      const pipeline = await storage.updatePipeline(id, validated);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      broadcast({ type: "pipeline:updated", companyId: pipeline.companyId });
      res.json(pipeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update pipeline" });
    }
  });

  app.delete("/api/pipelines/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid pipeline ID" });
      }
      const pipeline = await storage.getPipeline(id);
      const success = await storage.deletePipeline(id);
      if (!success) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      if (pipeline) {
        broadcast({ type: "pipeline:deleted", companyId: pipeline.companyId });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete pipeline" });
    }
  });

  function serializeKanbanColumn(column: KanbanColumn) {
    return {
      ...column,
      createdAt: column.createdAt.toISOString(),
    };
  }

  app.get("/api/columns", isAuthenticated, async (req, res) => {
    try {
      const pipelineIdParam = req.query.pipelineId as string | undefined;
      const pipelineId = pipelineIdParam === "null" ? null : pipelineIdParam ? parseInt(pipelineIdParam) : undefined;
      
      const columns = await storage.getAllKanbanColumns(pipelineId);
      res.json(columns.map(serializeKanbanColumn));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch columns" });
    }
  });

  app.get("/api/columns/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid column ID" });
      }
      const column = await storage.getKanbanColumn(id);
      if (!column) {
        return res.status(404).json({ error: "Column not found" });
      }
      res.json(serializeKanbanColumn(column));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch column" });
    }
  });

  app.post("/api/columns", isAuthenticated, async (req, res) => {
    try {
      const validated = insertKanbanColumnSchema.parse(req.body);
      const column = await storage.createKanbanColumn(validated);
      if (column.pipelineId !== null) {
        broadcast({ type: "column:created", pipelineId: column.pipelineId });
      }
      res.status(201).json(serializeKanbanColumn(column));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create column" });
    }
  });

  app.patch("/api/columns/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid column ID" });
      }
      const validated = updateKanbanColumnSchema.parse(req.body);
      const column = await storage.updateKanbanColumn(id, validated);
      if (!column) {
        return res.status(404).json({ error: "Column not found" });
      }
      if (column.pipelineId !== null) {
        broadcast({ type: "column:updated", pipelineId: column.pipelineId });
      }
      res.json(serializeKanbanColumn(column));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update column" });
    }
  });

  app.delete("/api/columns/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid column ID" });
      }
      const column = await storage.getKanbanColumn(id);
      const success = await storage.deleteKanbanColumn(id);
      if (!success) {
        return res.status(404).json({ error: "Column not found" });
      }
      if (column && column.pipelineId !== null) {
        broadcast({ type: "column:deleted", pipelineId: column.pipelineId });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete column" });
    }
  });

  function serializeContact(contact: Contact) {
    return {
      ...contact,
      createdAt: contact.createdAt.toISOString(),
    };
  }

  app.get("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const contacts = await storage.getAllContacts(companyId);
      res.json(contacts.map(serializeContact));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(serializeContact(contact));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const validated = insertContactSchema.parse(req.body);
      
      const duplicate = await storage.findDuplicateContact(
        validated.companyId,
        validated.name,
        validated.email,
        validated.phone
      );
      
      if (duplicate) {
        let errorMessage = "A contact already exists";
        if (duplicate.name === validated.name) {
          errorMessage = `A contact with the name "${validated.name}" already exists`;
        } else if (validated.email && duplicate.email === validated.email) {
          errorMessage = `A contact with the email "${validated.email}" already exists`;
        } else if (validated.phone && duplicate.phone === validated.phone) {
          errorMessage = `A contact with the phone number "${validated.phone}" already exists`;
        }
        
        return res.status(409).json({ 
          error: errorMessage,
          existingContactId: duplicate.id
        });
      }
      
      const contact = await storage.createContact(validated);
      broadcast({ type: "contact:created", companyId: contact.companyId });
      res.status(201).json(serializeContact(contact));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create contact" });
    }
  });

  app.post("/api/contacts/bulk-import", isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        contacts: z.array(z.object({
          name: z.string().optional().transform(v => v?.trim() || undefined),
          phone: z.string().optional().transform(v => v?.trim() || undefined),
          email: z.string().optional().transform(v => v?.trim() || undefined),
        })),
        companyId: z.number(),
      });
      
      const validated = schema.parse(req.body);
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };
      
      for (const contactData of validated.contacts) {
        try {
          const { name, phone, email } = contactData;
          
          if (!name && !phone && !email) {
            results.failed++;
            results.errors.push("Contact must have at least a name, phone, or email");
            continue;
          }
          
          const duplicate = await storage.findDuplicateContact(
            validated.companyId,
            name || "",
            email,
            phone
          );
          
          if (duplicate) {
            results.failed++;
            let identifier = name || phone || email;
            results.errors.push(`Duplicate contact: ${identifier}`);
            continue;
          }
          
          await storage.createContact({
            companyId: validated.companyId,
            name: name || phone || email || "Unknown Contact",
            phone: phone || undefined,
            email: email || undefined,
          });
          
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(error.message || "Unknown error");
        }
      }
      
      if (results.success > 0) {
        broadcast({ type: "contact:created", companyId: validated.companyId });
      }
      
      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to import contacts" });
    }
  });

  app.patch("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      const validated = updateContactSchema.parse(req.body);
      const contact = await storage.updateContact(id, validated);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      broadcast({ type: "contact:updated", companyId: contact.companyId });
      res.json(serializeContact(contact));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      const companyId = contact.companyId;
      await storage.deleteContact(id);
      broadcast({ type: "contact:deleted", companyId });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  function serializeOpportunity(opportunity: Opportunity | OpportunityWithContact) {
    return {
      ...opportunity,
      createdAt: opportunity.createdAt.toISOString(),
    };
  }

  app.get("/api/opportunities", isAuthenticated, async (req, res) => {
    try {
      const opportunities = await storage.getAllOpportunities();
      res.json(opportunities.map(serializeOpportunity));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  app.get("/api/opportunities/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid opportunity ID" });
      }
      const opportunity = await storage.getOpportunity(id);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.json(serializeOpportunity(opportunity));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunity" });
    }
  });

  app.post("/api/opportunities", isAuthenticated, async (req: any, res) => {
    try {
      const validated = insertOpportunitySchema.parse(req.body);
      
      // Get the contact to determine the company
      const contact = await storage.getContact(validated.contactId);
      if (!contact) {
        return res.status(400).json({ error: "Contact not found" });
      }
      
      // Verify the requesting user is a member of the contact's company
      const requestingUserRole = await storage.getUserRole(req.user.id, contact.companyId);
      if (!requestingUserRole) {
        return res.status(403).json({ error: "Access denied: You are not a member of this company" });
      }
      
      // If assignedUserId is provided, verify it belongs to the same company
      if (validated.assignedUserId) {
        const userRole = await storage.getUserRole(validated.assignedUserId, contact.companyId);
        if (!userRole) {
          return res.status(400).json({ error: "Assigned user must be a member of the same company" });
        }
      }
      
      const opportunity = await storage.createOpportunity(validated);
      broadcast({ type: "opportunity:created", companyId: contact.companyId });
      res.status(201).json(serializeOpportunity(opportunity));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create opportunity" });
    }
  });

  app.patch("/api/opportunities/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid opportunity ID" });
      }
      const validated = updateOpportunitySchema.parse(req.body);
      
      // Get existing opportunity to access its contact
      const existingOpportunity = await storage.getOpportunity(id);
      if (!existingOpportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      
      // Get the contact to determine the company
      const contact = await storage.getContact(existingOpportunity.contactId);
      if (!contact) {
        return res.status(400).json({ error: "Contact not found" });
      }
      
      // Verify the requesting user is a member of the contact's company
      const requestingUserRole = await storage.getUserRole(req.user.id, contact.companyId);
      if (!requestingUserRole) {
        return res.status(403).json({ error: "Access denied: You are not a member of this company" });
      }
      
      // If assignedUserId is provided, verify it belongs to the same company
      if (validated.assignedUserId) {
        const userRole = await storage.getUserRole(validated.assignedUserId, contact.companyId);
        if (!userRole) {
          return res.status(400).json({ error: "Assigned user must be a member of the same company" });
        }
      }
      
      const opportunity = await storage.updateOpportunity(id, validated);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      broadcast({ type: "opportunity:updated", companyId: contact.companyId });
      res.json(serializeOpportunity(opportunity));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update opportunity" });
    }
  });

  app.delete("/api/opportunities/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid opportunity ID" });
      }
      const opportunity = await storage.getOpportunity(id);
      const success = await storage.deleteOpportunity(id);
      if (!success) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      if (opportunity) {
        const contact = await storage.getContact(opportunity.contactId);
        if (contact) {
          broadcast({ type: "opportunity:deleted", companyId: contact.companyId });
        }
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete opportunity" });
    }
  });

  // Twilio routes
  app.post("/api/twilio/sms", isAuthenticated, async (req, res) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      console.log("SMS request received:", { to: req.body.to, hasMessage: !!req.body.message });
      console.log("Twilio config:", { 
        hasSid: !!accountSid, 
        hasToken: !!authToken, 
        hasPhone: !!fromNumber,
        phone: fromNumber ? `${fromNumber.substring(0, 5)}...` : 'missing'
      });

      if (!accountSid || !authToken || !fromNumber) {
        const missing = [];
        if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
        if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
        if (!fromNumber) missing.push('TWILIO_PHONE_NUMBER');
        console.error("Missing Twilio credentials:", missing.join(', '));
        return res.status(500).json({ 
          error: `Twilio credentials not configured. Missing: ${missing.join(', ')}` 
        });
      }

      const { to, message } = req.body;
      if (!to || !message) {
        return res.status(400).json({ error: "Missing 'to' or 'message' field" });
      }

      const client = twilio(accountSid, authToken);
      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: to
      });

      console.log("SMS sent successfully:", result.sid);
      res.json({ success: true, messageSid: result.sid });
    } catch (error: any) {
      console.error("Twilio SMS error:", error.message, error.code, error.status);
      res.status(500).json({ error: error.message || "Failed to send SMS" });
    }
  });

  app.post("/api/twilio/call", isAuthenticated, async (req, res) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      console.log("Call request received:", { to: req.body.to });
      console.log("Twilio config:", { 
        hasSid: !!accountSid, 
        hasToken: !!authToken, 
        hasPhone: !!fromNumber,
        phone: fromNumber ? `${fromNumber.substring(0, 5)}...` : 'missing'
      });

      if (!accountSid || !authToken || !fromNumber) {
        const missing = [];
        if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
        if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
        if (!fromNumber) missing.push('TWILIO_PHONE_NUMBER');
        console.error("Missing Twilio credentials:", missing.join(', '));
        return res.status(500).json({ 
          error: `Twilio credentials not configured. Missing: ${missing.join(', ')}` 
        });
      }

      const { to } = req.body;
      if (!to) {
        return res.status(400).json({ error: "Missing 'to' field" });
      }

      const client = twilio(accountSid, authToken);
      
      // Create TwiML URL - use https and the correct host
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      const host = req.get('host');
      const twimlUrl = `${protocol}://${host}/api/twilio/twiml`;
      
      console.log("Initiating call with TwiML URL:", twimlUrl);
      
      const result = await client.calls.create({
        url: twimlUrl,
        to: to,
        from: fromNumber
      });

      console.log("Call initiated successfully:", result.sid);
      res.json({ success: true, callSid: result.sid });
    } catch (error: any) {
      console.error("Twilio call error:", {
        message: error.message,
        code: error.code,
        status: error.status,
        moreInfo: error.moreInfo
      });
      res.status(500).json({ error: error.message || "Failed to initiate call" });
    }
  });

  app.post("/api/twilio/twiml", async (req, res) => {
    try {
      console.log("TwiML endpoint called");
      const VoiceResponse = twilio.twiml.VoiceResponse;
      const response = new VoiceResponse();
      
      response.say('Hello! This is a call from your Client Queue Manager application.');
      
      res.type('text/xml');
      res.send(response.toString());
    } catch (error: any) {
      console.error("TwiML error:", error);
      res.status(500).send('Error generating TwiML');
    }
  });

  // Generate access token for Voice SDK (browser calling)
  app.get("/api/twilio/token", isAuthenticated, async (req, res) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const apiKey = process.env.TWILIO_API_KEY;
      const apiSecret = process.env.TWILIO_API_SECRET;
      const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

      console.log("Token request - Config check:", {
        hasSid: !!accountSid,
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
        hasTwimlApp: !!twimlAppSid
      });

      if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
        const missing = [];
        if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
        if (!apiKey) missing.push('TWILIO_API_KEY');
        if (!apiSecret) missing.push('TWILIO_API_SECRET');
        if (!twimlAppSid) missing.push('TWILIO_TWIML_APP_SID');
        console.error("Missing credentials for token generation:", missing.join(', '));
        return res.status(500).json({ 
          error: `Missing credentials: ${missing.join(', ')}` 
        });
      }

      // Use consistent identity for browser client to receive incoming calls
      const identity = 'browser_client';

      const AccessToken = twilio.jwt.AccessToken;
      const VoiceGrant = AccessToken.VoiceGrant;

      const token = new AccessToken(accountSid, apiKey, apiSecret, { 
        identity,
        ttl: 3600 // 1 hour
      });

      const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: true
      });

      token.addGrant(voiceGrant);

      console.log("Access token generated for identity:", identity);
      res.json({ 
        token: token.toJwt(), 
        identity 
      });
    } catch (error: any) {
      console.error("Token generation error:", error.message);
      res.status(500).json({ error: error.message || "Failed to generate token" });
    }
  });

  // Test endpoint to verify webhook URL is reachable
  app.get("/api/twilio/voice", (req, res) => {
    console.log("GET request to voice endpoint - Twilio uses POST");
    res.json({ 
      message: "Voice webhook is active. Twilio should POST to this URL.",
      expectedMethod: "POST"
    });
  });

  // Voice webhook endpoint - handles both incoming calls and outbound calls
  app.post("/api/twilio/voice", async (req, res) => {
    try {
      console.log("🔔 VOICE WEBHOOK CALLED!");
      console.log("Method:", req.method);
      console.log("Headers:", req.headers);
      console.log("Request body:", req.body);
      console.log("Query params:", req.query);
      
      const VoiceResponse = twilio.twiml.VoiceResponse;
      const response = new VoiceResponse();

      const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
      const toNumber = req.body.To || req.query.To;
      const fromNumber = req.body.From;
      
      // If the call is TO the Twilio number, it's incoming - route to browser
      // If there's a custom 'To' parameter from browser, it's outbound
      const isIncomingCall = toNumber === twilioNumber;

      if (isIncomingCall) {
        // Incoming call to Twilio number - route to browser
        console.log(`Incoming call from ${fromNumber} - routing to browser client`);
        const dial = response.dial({
          callerId: fromNumber
        });
        // Route to the browser using the identity 'browser_client'
        // The Device will fire 'incoming' event when this happens
        dial.client('browser_client');
      } else {
        // Outbound call from browser to phone number
        console.log(`Outbound call: Dialing ${toNumber} from ${twilioNumber}`);
        response.dial({ 
          callerId: twilioNumber 
        }, toNumber);
      }

      const twiml = response.toString();
      console.log("Returning TwiML:", twiml);
      
      res.type('text/xml');
      res.send(twiml);
    } catch (error: any) {
      console.error("Voice endpoint error:", error);
      const VoiceResponse = twilio.twiml.VoiceResponse;
      const errorResponse = new VoiceResponse();
      errorResponse.say('An error occurred. Please try again.');
      res.type('text/xml');
      res.send(errorResponse.toString());
    }
  });

  // Get call logs for a specific contact
  app.get("/api/twilio/calls/:phoneNumber", isAuthenticated, async (req, res) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
      const phoneNumber = req.params.phoneNumber;

      if (!accountSid || !authToken || !twilioNumber) {
        return res.status(500).json({ error: "Missing Twilio credentials" });
      }

      const client = twilio(accountSid, authToken);

      // Fetch both incoming and outgoing calls
      const [incomingCalls, outgoingCalls] = await Promise.all([
        client.calls.list({ from: phoneNumber, to: twilioNumber, limit: 50 }),
        client.calls.list({ from: twilioNumber, to: phoneNumber, limit: 50 })
      ]);

      const allCalls = [...incomingCalls, ...outgoingCalls]
        .map(call => ({
          sid: call.sid,
          from: call.from,
          to: call.to,
          status: call.status,
          direction: call.direction,
          duration: call.duration,
          startTime: call.startTime,
          endTime: call.endTime,
          price: call.price,
          priceUnit: call.priceUnit
        }))
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

      res.json(allCalls);
    } catch (error: any) {
      console.error("Error fetching calls:", error);
      res.status(500).json({ error: error.message || "Failed to fetch calls" });
    }
  });

  // Get SMS messages for a specific contact
  app.get("/api/twilio/messages/:phoneNumber", isAuthenticated, async (req, res) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
      const phoneNumber = req.params.phoneNumber;

      if (!accountSid || !authToken || !twilioNumber) {
        return res.status(500).json({ error: "Missing Twilio credentials" });
      }

      const client = twilio(accountSid, authToken);

      // Fetch both incoming and outgoing messages
      const [incomingMessages, outgoingMessages] = await Promise.all([
        client.messages.list({ from: phoneNumber, to: twilioNumber, limit: 50 }),
        client.messages.list({ from: twilioNumber, to: phoneNumber, limit: 50 })
      ]);

      const allMessages = [...incomingMessages, ...outgoingMessages]
        .map(message => ({
          sid: message.sid,
          from: message.from,
          to: message.to,
          body: message.body,
          status: message.status,
          direction: message.direction,
          dateSent: message.dateSent,
          dateCreated: message.dateCreated,
          price: message.price,
          priceUnit: message.priceUnit
        }))
        .sort((a, b) => new Date(b.dateSent || b.dateCreated).getTime() - new Date(a.dateSent || a.dateCreated).getTime());

      res.json(allMessages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: error.message || "Failed to fetch messages" });
    }
  });

  // Get recordings for a specific call
  app.get("/api/twilio/recordings/:callSid", isAuthenticated, async (req, res) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const callSid = req.params.callSid;

      if (!accountSid || !authToken) {
        return res.status(500).json({ error: "Missing Twilio credentials" });
      }

      const client = twilio(accountSid, authToken);

      const recordings = await client.recordings.list({ callSid, limit: 20 });

      const recordingData = recordings.map(recording => ({
        sid: recording.sid,
        duration: recording.duration,
        dateCreated: recording.dateCreated,
        url: `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`,
        status: recording.status
      }));

      res.json(recordingData);
    } catch (error: any) {
      console.error("Error fetching recordings:", error);
      res.status(500).json({ error: error.message || "Failed to fetch recordings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
