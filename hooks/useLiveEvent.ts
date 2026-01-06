"use client";

import { useEffect } from "react";
import type { SSEEvent } from "@/lib/sse/types";
import { useLiveEvents } from "@/components/live-events-provider";

export function useLiveEvent(
  eventName: string,
  handler: (event: SSEEvent) => void,
) {
  const { onEvent } = useLiveEvents();

  useEffect(() => onEvent(eventName, handler), [eventName, handler, onEvent]);
}
