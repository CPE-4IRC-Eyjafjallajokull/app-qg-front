import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import Link from "next/link";
import { ArrowRight, Zap, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Welcome to QG</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Real-time event streaming and operational dashboard for emergency
              management.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* SSE Events Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <CardTitle>Real-time Events</CardTitle>
                </div>
                <CardDescription>Server-Sent Events streaming</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Monitor live event streams from the API with automatic
                  reconnection and real-time updates.
                </p>
                <Link href="/events">
                  <Button className="w-full" variant="default">
                    View Events Stream
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Health Check Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <CardTitle>System Status</CardTitle>
                </div>
                <CardDescription>API health and connectivity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Check the health and status of all connected services and
                  systems.
                </p>
                <Button className="w-full" variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Get up and running in minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-6">1.</span>
                  <span>
                    Ensure the API is running on{" "}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                      localhost:8000
                    </code>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-6">2.</span>
                  <span>
                    Navigate to the{" "}
                    <Link
                      href="/events"
                      className="text-blue-600 hover:underline"
                    >
                      Events Stream
                    </Link>{" "}
                    page
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-6">3.</span>
                  <span>
                    Watch real-time events as they arrive from the server
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> This is a minimal testing interface using
                shadcn/ui components. It demonstrates SSE integration between
                the Next.js frontend and FastAPI backend.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
