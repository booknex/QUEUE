import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket client connected");

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
}

export type BroadcastEvent = 
  | { type: "file:created" | "file:updated" | "file:deleted" | "file:touched" | "file:closed"; companyId: number }
  | { type: "company:created" | "company:updated" | "company:deleted"; companyId: number }
  | { type: "pipeline:created" | "pipeline:updated" | "pipeline:deleted"; companyId: number }
  | { type: "column:created" | "column:deleted"; pipelineId: number }
  | { type: "opportunity:created" | "opportunity:updated" | "opportunity:deleted"; companyId: number }
  | { type: "contact:created"; companyId: number };

export function broadcast(event: BroadcastEvent) {
  if (!wss) {
    console.warn("WebSocket server not initialized");
    return;
  }

  const message = JSON.stringify(event);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
