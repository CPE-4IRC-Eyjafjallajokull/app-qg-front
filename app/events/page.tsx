"use client";

import { useSSE } from "@/hooks/useSSE";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { publicEnv } from "@/lib/env.public";
import { AlertCircle, CheckCircle2, Circle, Trash2 } from "lucide-react";

export default function EventsPage() {
  const apiUrl = publicEnv.NEXT_PUBLIC_API_URL;
  const { data, isConnected, error } = useSSE(`${apiUrl}/events`);
  const [events, setEvents] = useState<{ event: string; timestamp: string }[]>(
    [],
  );

  // Ajouter chaque événement à la liste
  if (data && events[events.length - 1]?.timestamp !== data.timestamp) {
    setEvents((prev) => [...prev, data]);
  }

  const clearEvents = () => setEvents([]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "connected":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "heartbeat":
        return <Circle className="w-4 h-4 text-blue-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              SSE Events Stream
            </h1>
            <p className="text-muted-foreground">
              Real-time event streaming from the API
            </p>
          </div>

          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Connection Status
                </CardTitle>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm">
                  {isConnected ? "Connected to API" : "Connection lost"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                API:{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  {apiUrl}
                </code>
              </p>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-950">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <CardTitle className="text-sm">Connection Error</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Events Log Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Events Log</CardTitle>
                  <CardDescription>
                    {events.length} events received
                  </CardDescription>
                </div>
                {events.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearEvents}
                    className="h-8 px-2"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Circle className="w-4 h-4 mr-2 opacity-50" />
                  Waiting for events...
                </div>
              ) : (
                <ScrollArea className="h-64 pr-4">
                  <div className="space-y-2">
                    {events.map((evt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded border bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getEventIcon(evt.event)}
                          <span className="font-mono text-sm font-medium">
                            {evt.event}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                • API sends a{" "}
                <code className="bg-background px-1 rounded text-xs">
                  connected
                </code>{" "}
                event on startup
              </p>
              <p>• Heartbeat events are sent every 5 seconds</p>
              <p>• Connection automatically reconnects on disconnect</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
