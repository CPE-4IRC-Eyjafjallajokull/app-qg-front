import { useEffect, useState } from "react";

export interface SSEEvent {
  event: string;
  timestamp: string;
  data?: unknown;
}

export function useSSE(url: string) {
  const [data, setData] = useState<SSEEvent | null>(null);
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    const handleEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        const normalized: SSEEvent = {
          ...payload,
          event: payload.event || event.type || "message",
          timestamp: payload.timestamp || new Date().toISOString(),
          data: payload.data ?? payload,
        };
        setData(normalized);
        setEvents((prev) => {
          if (prev[prev.length - 1]?.timestamp === normalized.timestamp) {
            return prev;
          }
          return [...prev, normalized];
        });
        setError(null);
      } catch (err) {
        setError(`Failed to parse event: ${err}`);
      }
    };

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    // Default unnamed events
    eventSource.onmessage = handleEvent;

    // Upstream emits named events (e.g. "connected", "incident_declared")
    const namedEvents = [
      "connected",
      "heartbeat",
      "new_incident",
      "incident_ack",
    ];
    namedEvents.forEach((evt) =>
      eventSource.addEventListener(evt, handleEvent as EventListener),
    );

    eventSource.onerror = () => {
      setIsConnected(false);
      setError("Connection error with SSE stream");
      eventSource.close();
    };

    return () => {
      namedEvents.forEach((evt) =>
        eventSource.removeEventListener(evt, handleEvent as EventListener),
      );
      eventSource.close();
    };
  }, [url]);

  const clearEvents = () => setEvents([]);

  return { data, events, isConnected, error, clearEvents };
}
