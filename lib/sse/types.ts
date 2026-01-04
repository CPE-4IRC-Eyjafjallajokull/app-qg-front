export type SSEEvent = {
  event: string;
  timestamp: string;
  data?: unknown;
};
