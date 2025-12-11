"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: {
    [key: string]: { title: string; description: string };
  } = {
    AccessDenied: {
      title: "Access Denied",
      description: "You do not have permission to access this application.",
    },
    OAuthSignin: {
      title: "Sign In Error",
      description: "Error connecting to the authentication provider.",
    },
    OAuthCallback: {
      title: "Callback Error",
      description: "Error during the authentication callback.",
    },
  };

  const errorInfo = errorMessages[error as string] || {
    title: "Authentication Error",
    description: "An unexpected error occurred during authentication.",
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              {errorInfo.title}
            </CardTitle>
          </div>
          <CardDescription>{errorInfo.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Error code:{" "}
            <code className="bg-muted px-2 py-1 rounded text-xs">{error}</code>
          </p>

          <div className="space-y-2">
            <Link href="/auth/signin" className="block">
              <Button variant="default" className="w-full">
                Try Again
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
