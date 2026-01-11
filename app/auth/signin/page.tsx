"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Shield,
  Radio,
  MapPin,
  Truck,
  Loader2,
} from "lucide-react";
import { Suspense, useState } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("keycloak", {
      redirect: true,
      callbackUrl: "/",
    });
  };

  const errorMessages: Record<string, { title: string; description: string }> =
    {
      AccessDenied: {
        title: "Access Denied",
        description:
          "You do not have permission to access this application. Contact your administrator.",
      },
      OAuthSignin: {
        title: "Authentication Error",
        description:
          "An error occurred during the sign-in process. Please try again.",
      },
      OAuthCallback: {
        title: "Callback Error",
        description:
          "Authentication callback failed. Please try signing in again.",
      },
      Default: {
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
      },
    };

  const currentError = error
    ? errorMessages[error] || errorMessages.Default
    : null;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">SDMIS</h1>
                <p className="text-sm text-white/70">Quartier General</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Centre de Commandement
                <br />
                <span className="text-white/80">Operations</span>
              </h2>
              <p className="text-lg text-white/70 max-w-md">
                Plateforme de gestion des interventions et coordination des
                moyens de secours du departement du Rhone.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FeatureCard
                icon={<Radio className="w-5 h-5" />}
                title="Temps reel"
                description="Suivi des unites"
              />
              <FeatureCard
                icon={<MapPin className="w-5 h-5" />}
                title="Geolocalisation"
                description="Cartographie live"
              />
              <FeatureCard
                icon={<Truck className="w-5 h-5" />}
                title="Vehicules"
                description="Gestion de flotte"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/50">
            <span>Service Departemental-Metropolitain</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Incendie et Secours</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Lyon</span>
          </div>
        </div>

        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-foreground">SDMIS</h1>
                <p className="text-xs text-muted-foreground">
                  Quartier General
                </p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Connexion
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Authentifiez-vous pour acceder au centre de commandement
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentError && (
                <div className="flex gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-destructive text-sm">
                      {currentError.title}
                    </p>
                    <p className="text-sm text-destructive/80">
                      {currentError.description}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSignIn}
                className="w-full h-12 text-base font-medium"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Se connecter avec Keycloak
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Acces securise
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span>Authentification SSO centralisee</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span>Connexion chiffree de bout en bout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span>Session securisee et limitee dans le temps</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground px-4">
            Acces reserve aux personnels habilites du SDMIS.
            <br />
            Toute tentative d&apos;acces non autorise est enregistree.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
      <div className="mb-2 text-white/90">{icon}</div>
      <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
      <p className="text-xs text-white/60">{description}</p>
    </div>
  );
}

function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <Shield className="w-7 h-7 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Chargement...</span>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  );
}
