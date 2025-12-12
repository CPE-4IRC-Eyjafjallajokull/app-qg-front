"use client";

import { useSSE } from "@/hooks/useSSE";
import { useEffect, useState } from "react";
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
import { AlertCircle, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DemoPage() {
  const { data, events, isConnected, error, clearEvents } =
    useSSE("/api/events");
  const [demoScenarioPayload, setDemoScenarioPayload] = useState({
    type: "demo-incident",
    description: "Incident déclaré via la démo QG Dashboard",
    location: {
      lat: 48.8566,
      lng: 2.3522,
    },
  });

  useEffect(() => {
    if (data) {
      console.log("New SSE event received:", data);
    }
  }, [data, isConnected]);

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

  const startDemoScenario = async () => {
    try {
      const response = await fetch("/api/demo/start", {
        method: "POST",
        body: JSON.stringify(demoScenarioPayload),
      });
      if (response.ok) {
        toast.success("Demo scenario started");
      } else {
        toast.error("Failed to start demo scenario");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred while starting the demo scenario");
    }
  };

  const updateDemoPayload = (newPayload: string) => {
    try {
      const parsed = JSON.parse(newPayload);
      setDemoScenarioPayload(parsed);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Ignore JSON parse errors
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Demo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Start demo scenario */}
              <p className="text-sm text-muted-foreground">
                Cette démo illustre comment un incident peut etre déclaré par un
                usager et comment le système intéragit en temps réel via les
                événements SSE.
              </p>

              <div className="mt-4 space-y-2">
                <Textarea
                  className="h-32"
                  value={JSON.stringify(demoScenarioPayload, null, 2)}
                  onChange={(e) => updateDemoPayload(e.target.value)}
                />
                <Button variant="default" onClick={startDemoScenario}>
                  Démarrer le scénario de démo
                </Button>
              </div>
            </CardContent>
          </Card>

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
                    {events.map((evt, idx) => {
                      const tooltipContent = JSON.stringify(
                        evt.data ?? evt,
                        null,
                        2,
                      );
                      return (
                        <Tooltip key={idx} delayDuration={150}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between p-2 rounded border bg-muted/50 hover:bg-muted transition-colors cursor-default">
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
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="start"
                            sideOffset={8}
                            className="max-w-[320px] whitespace-pre-wrap break-words font-mono text-[11px] text-left"
                          >
                            <pre className="whitespace-pre-wrap break-words max-h-60 overflow-auto">
                              {tooltipContent}
                            </pre>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
