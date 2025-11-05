import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientFileSchema, updateClientFileSchema, touchFileSchema, closeFileSchema, insertPipelineSchema, updatePipelineSchema, insertKanbanColumnSchema, updateKanbanColumnSchema, insertContactSchema, insertOpportunitySchema, updateOpportunitySchema, insertCompanySchema, updateCompanySchema } from "@shared/schema";
import { z } from "zod";
import type { ClientFile, WorkSession, Pipeline, KanbanColumn, Contact, Opportunity, OpportunityWithContact, Company } from "@shared/schema";
import { broadcast } from "./websocket";

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

function serializeCompany(company: Company) {
  return {
    ...company,
    createdAt: company.createdAt.toISOString(),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Company routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies.map(serializeCompany));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
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

  app.post("/api/companies", async (req, res) => {
    try {
      const validated = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validated);
      broadcast({ type: "company:created", companyId: company.id });
      res.status(201).json(serializeCompany(company));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  app.patch("/api/companies/:id", async (req, res) => {
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

  app.delete("/api/companies/:id", async (req, res) => {
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

  // File routes
  app.get("/api/files", async (req, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const files = await storage.getAllFiles(companyId);
      res.json(files.map(serializeFile));
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
      res.json(serializeFile(file));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch file" });
    }
  });

  app.post("/api/files", async (req, res) => {
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
      broadcast({ type: "file:updated", companyId: file.companyId });
      res.json(serializeFile(file));
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
      
      broadcast({ type: "file:touched", companyId: file.companyId });
      res.json(serializeFile(file));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to touch file" });
    }
  });

  app.post("/api/files/:id/close", async (req, res) => {
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

  app.get("/api/files/:id/sessions", async (req, res) => {
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

  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllWorkSessions();
      res.json(sessions.map(serializeSession));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work sessions" });
    }
  });

  app.get("/api/pipelines", async (req, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const pipelines = await storage.getAllPipelines(companyId);
      res.json(pipelines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pipelines" });
    }
  });

  app.get("/api/pipelines/:id", async (req, res) => {
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

  app.post("/api/pipelines", async (req, res) => {
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

  app.patch("/api/pipelines/:id", async (req, res) => {
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

  app.delete("/api/pipelines/:id", async (req, res) => {
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

  app.get("/api/columns", async (req, res) => {
    try {
      const pipelineIdParam = req.query.pipelineId as string | undefined;
      const pipelineId = pipelineIdParam === "null" ? null : pipelineIdParam ? parseInt(pipelineIdParam) : undefined;
      
      const columns = await storage.getAllKanbanColumns(pipelineId);
      res.json(columns.map(serializeKanbanColumn));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch columns" });
    }
  });

  app.get("/api/columns/:id", async (req, res) => {
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

  app.post("/api/columns", async (req, res) => {
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

  app.patch("/api/columns/:id", async (req, res) => {
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
      res.json(serializeKanbanColumn(column));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update column" });
    }
  });

  app.delete("/api/columns/:id", async (req, res) => {
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

  app.get("/api/contacts", async (req, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const contacts = await storage.getAllContacts(companyId);
      res.json(contacts.map(serializeContact));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
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

  app.post("/api/contacts", async (req, res) => {
    try {
      const validated = insertContactSchema.parse(req.body);
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

  function serializeOpportunity(opportunity: Opportunity | OpportunityWithContact) {
    return {
      ...opportunity,
      createdAt: opportunity.createdAt.toISOString(),
    };
  }

  app.get("/api/opportunities", async (req, res) => {
    try {
      const opportunities = await storage.getAllOpportunities();
      res.json(opportunities.map(serializeOpportunity));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  app.get("/api/opportunities/:id", async (req, res) => {
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

  app.post("/api/opportunities", async (req, res) => {
    try {
      const validated = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(validated);
      const contact = await storage.getContact(opportunity.contactId);
      if (contact) {
        broadcast({ type: "opportunity:created", companyId: contact.companyId });
      }
      res.status(201).json(serializeOpportunity(opportunity));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create opportunity" });
    }
  });

  app.patch("/api/opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid opportunity ID" });
      }
      const validated = updateOpportunitySchema.parse(req.body);
      const opportunity = await storage.updateOpportunity(id, validated);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      const contact = await storage.getContact(opportunity.contactId);
      if (contact) {
        broadcast({ type: "opportunity:updated", companyId: contact.companyId });
      }
      res.json(serializeOpportunity(opportunity));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update opportunity" });
    }
  });

  app.delete("/api/opportunities/:id", async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
