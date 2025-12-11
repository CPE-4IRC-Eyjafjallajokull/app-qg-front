import { useEffect, useState } from "react";

interface SSEEvent {
  event: string;
  timestamp: string;
}

export function useSSE(url: string) {
  const [data, setData] = useState<SSEEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setData(payload);
      } catch (err) {
        setError(`Failed to parse event: ${err}`);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError("Connection error with SSE stream");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return { data, isConnected, error };
}
