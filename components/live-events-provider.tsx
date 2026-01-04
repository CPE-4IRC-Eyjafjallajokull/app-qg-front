"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import type { SSEEvent } from "@/lib/sse/types";

type SSEListener = (event: SSEEvent) => void;

type SSEContextValue = {
  isConnected: boolean;
  error: string | null;
  lastEvent: SSEEvent | null;
  onEvent: (eventName: string, listener: SSEListener) => () => void;
  onAny: (listener: SSEListener) => () => void;
};

const LiveEventsContext = createContext<SSEContextValue | null>(null);

const normalizeEvent = (event: MessageEvent): SSEEvent => {
  const payload = JSON.parse(event.data);
  const eventName = payload.event || event.type || "message";
  return {
    ...payload,
    event: eventName,
    timestamp: payload.timestamp || new Date().toISOString(),
    data: payload.data ?? payload,
  };
};

export function LiveEventsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const listenersRef = useRef(new Map<string, Set<SSEListener>>());
  const anyListenersRef = useRef(new Set<SSEListener>());
  const eventSourceRef = useRef<EventSource | null>(null);
  const registeredEventsRef = useRef(new Set<string>());
  const [connectionState, setConnectionState] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);

  const handleEvent = useCallback((event: MessageEvent) => {
    try {
      const normalized = normalizeEvent(event);
      setLastEvent(normalized);
      anyListenersRef.current.forEach((listener) => listener(normalized));
      listenersRef.current
        .get(normalized.event)
        ?.forEach((listener) => listener(normalized));
      setErrorState(null);
    } catch (err) {
      setErrorState(`Failed to parse event: ${err}`);
    }
  }, []);

  const registerEventSource = useCallback(
    (eventName: string) => {
      const eventSource = eventSourceRef.current;
      if (!eventSource || registeredEventsRef.current.has(eventName)) {
        return;
      }
      eventSource.addEventListener(eventName, handleEvent);
      registeredEventsRef.current.add(eventName);
    },
    [handleEvent],
  );

  const unregisterEventSource = useCallback(
    (eventName: string) => {
      const eventSource = eventSourceRef.current;
      if (!eventSource || !registeredEventsRef.current.has(eventName)) {
        return;
      }
      eventSource.removeEventListener(eventName, handleEvent);
      registeredEventsRef.current.delete(eventName);
    },
    [handleEvent],
  );

  const onEvent = useCallback(
    (eventName: string, listener: SSEListener) => {
      const listeners = listenersRef.current.get(eventName) ?? new Set();
      listeners.add(listener);
      listenersRef.current.set(eventName, listeners);
      registerEventSource(eventName);
      return () => {
        const current = listenersRef.current.get(eventName);
        if (!current) {
          return;
        }
        current.delete(listener);
        if (current.size === 0) {
          listenersRef.current.delete(eventName);
          unregisterEventSource(eventName);
        }
      };
    },
    [registerEventSource, unregisterEventSource],
  );

  const onAny = useCallback((listener: SSEListener) => {
    anyListenersRef.current.add(listener);
    return () => {
      anyListenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      registeredEventsRef.current.clear();
      return;
    }

    const eventSource = new EventSource("/api/events");
    const registeredEvents = registeredEventsRef.current;
    eventSourceRef.current = eventSource;
    registeredEvents.clear();
    eventSource.addEventListener("message", handleEvent);
    listenersRef.current.forEach((_, eventName) => {
      registerEventSource(eventName);
    });

    eventSource.onopen = () => {
      setConnectionState(true);
      setErrorState(null);
    };

    eventSource.onerror = () => {
      setConnectionState(false);
      setErrorState("Connection error with SSE stream");
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      registeredEvents.clear();
    };
  }, [handleEvent, registerEventSource, status]);

  const isConnected = status === "authenticated" && connectionState;
  const error = status === "authenticated" ? errorState : null;

  const value = useMemo(
    () => ({
      isConnected,
      error,
      lastEvent,
      onEvent,
      onAny,
    }),
    [isConnected, error, lastEvent, onEvent, onAny],
  );

  return (
    <LiveEventsContext.Provider value={value}>
      {children}
    </LiveEventsContext.Provider>
  );
}

export function useLiveEvents() {
  const context = useContext(LiveEventsContext);
  if (!context) {
    throw new Error("useLiveEvents must be used within a LiveEventsProvider");
  }
  return context;
}
