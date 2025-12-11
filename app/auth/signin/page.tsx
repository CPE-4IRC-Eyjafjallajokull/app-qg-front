"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { AlertCircle, LogIn } from "lucide-react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleSignIn = async () => {
    await signIn("keycloak", { 
      redirect: true, 
      callbackUrl: "/" 
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Welcome to QG</CardTitle>
          <CardDescription>Sign in with your Keycloak account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div className="text-sm">
                <p className="font-semibold text-red-700 dark:text-red-300">
                  {error === "AccessDenied" && "Access Denied"}
                  {error === "OAuthSignin" && "OAuth SignIn Error"}
                  {error === "OAuthCallback" && "OAuth Callback Error"}
                  {error === "Default" && "An error occurred"}
                </p>
                <p className="text-red-600 dark:text-red-400">
                  Please try again or contact support.
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSignIn}
            className="w-full"
            size="lg"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign in with Keycloak
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This is a secure application. You need to authenticate to access the dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
