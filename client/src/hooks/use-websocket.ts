import { useEffect, useRef } from "react";
import { queryClient } from "@/lib/queryClient";

type WebSocketEvent =
  | { type: "file:created" | "file:updated" | "file:deleted" | "file:touched" | "file:closed"; companyId: number }
  | { type: "company:created" | "company:updated" | "company:deleted"; companyId: number }
  | { type: "pipeline:created" | "pipeline:updated" | "pipeline:deleted"; companyId: number }
  | { type: "column:created" | "column:updated" | "column:deleted"; pipelineId: number }
  | { type: "opportunity:created" | "opportunity:updated" | "opportunity:deleted"; companyId: number }
  | { type: "contact:created"; companyId: number };

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);
          handleWebSocketEvent(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        wsRef.current = null;

        // Reconnect with exponential backoff
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log(`Reconnecting WebSocket (attempt ${reconnectAttemptsRef.current})...`);
          connect();
        }, delay);
      };
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
}

function handleWebSocketEvent(event: WebSocketEvent) {
  console.log("WebSocket event received:", event);

  switch (event.type) {
    case "file:created":
    case "file:updated":
    case "file:deleted":
    case "file:touched":
    case "file:closed":
      queryClient.invalidateQueries({ queryKey: ["/api/files", event.companyId.toString()] });
      break;

    case "company:created":
    case "company:updated":
    case "company:deleted":
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      break;

    case "pipeline:created":
    case "pipeline:updated":
    case "pipeline:deleted":
      queryClient.invalidateQueries({ queryKey: ["/api/pipelines", event.companyId.toString()] });
      break;

    case "column:created":
    case "column:updated":
    case "column:deleted":
      queryClient.invalidateQueries({ queryKey: ["/api/columns", event.pipelineId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      break;

    case "opportunity:created":
    case "opportunity:updated":
    case "opportunity:deleted":
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities", event.companyId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", event.companyId.toString()] });
      break;

    case "contact:created":
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", event.companyId.toString()] });
      break;

    default:
      console.warn("Unknown WebSocket event type:", event);
  }
}
