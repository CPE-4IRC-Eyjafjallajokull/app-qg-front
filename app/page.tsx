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
import {
  Activity,
  ArrowRight,
  GitBranch,
  MapPinned,
  Play,
  Server,
  ShieldCheck,
  Waves,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1">
      <Header />

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
        <section className="relative overflow-hidden rounded-3xl border bg-slate-950 px-8 py-10 text-slate-50 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(94,234,212,0.12),transparent_25%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Système Intégré de Gestion et Suivi des Incidents
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                App QG - supervision en temps quasi réel, du terrain à la
                décision.
              </h1>
              <p className="text-base text-slate-200">
                Interface opérateur, API FastAPI, moteur Java, et chaîne IoT
                réunis sur une même plateforme. Visualisez le flux SSE, suivez
                les incidents et déclenchez la simulation sans quitter le QG.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "SSE temps réel",
                  "API FastAPI",
                  "Moteur Java",
                  "IoT terrain",
                  "Simulation complète",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/demo">
                  <Button className="gap-2 bg-slate-100 text-slate-900 hover:bg-white">
                    Ouvrir le flux événements
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="ghost" className="gap-2">
                    Lancer une démo
                    <Play className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <Card className="w-full max-w-sm border-white/15 bg-white/5 text-slate-50 shadow-none">
              <CardHeader>
                <CardTitle>Bloc QG</CardTitle>
                <CardDescription className="text-slate-200">
                  Les services clés orchestrés pour le poste opérateur.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Server className="h-5 w-5 text-cyan-300" />
                  <div>
                    <p className="font-medium">API FastAPI</p>
                    <p className="text-slate-200">
                      Point d’entrée normalisé et agrégation des événements.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GitBranch className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="font-medium">Moteur décisionnel Java</p>
                    <p className="text-slate-200">
                      Centralise états incidents/interventions et applique les
                      règles métier.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-amber-300" />
                  <div>
                    <p className="font-medium">Interface opérateur</p>
                    <p className="text-slate-200">
                      Cartographie, supervision et actions guidées depuis le QG.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-cyan-600">
                <Waves className="h-5 w-5" />
                <CardTitle>Flux SSE</CardTitle>
              </div>
              <CardDescription>
                Suivi continu des événements entrants.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Reconnexion automatique, diffusion live et visibilité
                instantanée pour les incidents, positions et affectations.
              </p>
              <Link href="/demo">
                <Button variant="secondary" className="w-full gap-2">
                  Consulter le flux
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-emerald-600">
                <MapPinned className="h-5 w-5" />
                <CardTitle>IoT Terrain</CardTitle>
              </div>
              <CardDescription>
                micro:bit → passerelle RF → UART → moteur.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Messages GPS, états véhicules et signaux d’intervention sont
                normalisés avant d’alimenter le cœur métier.
              </p>
              <p className="text-xs text-muted-foreground">
                Trafic piloté via RabbitMQ pour la diffusion interne.
              </p>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-indigo-600">
                <Play className="h-5 w-5" />
                <CardTitle>Simulation</CardTitle>
              </div>
              <CardDescription>
                Scénarios complets sans matériel réel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Génère incidents, véhicules et événements externes injectés dans
                l’API ou RabbitMQ pour tester les parcours.
              </p>
              <Link href="/demo">
                <Button
                  variant="secondary"
                  className="w-full gap-2 text-indigo-600"
                >
                  Démarrer une simulation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-slate-800">
                <ShieldCheck className="h-5 w-5" />
                <CardTitle>Socle technique</CardTitle>
              </div>
              <CardDescription>
                Tout ce dont l’opérateur a besoin pour superviser.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>
                  Authentification et rôles via Keycloak pour sécuriser l’UI et
                  l’API.
                </li>
                <li>
                  RabbitMQ assure le routage interne des incidents, positions et
                  affectations.
                </li>
                <li>
                  PostgreSQL stocke durablement incidents, véhicules et journaux
                  d’événements.
                </li>
                <li>
                  Documentation centralisée pour rester aligné sur les décisions
                  techniques.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-muted/60">
            <CardHeader>
              <CardTitle>Démarrer en local</CardTitle>
              <CardDescription>
                Parcours rapide pour connecter le Front QG.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ol className="space-y-2">
                <li>
                  1. Vérifier l’API sur{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    localhost:3001
                  </code>
                  . (seulement si lancée localement)
                </li>
                <li>
                  2. Ouvrir le flux SSE via{" "}
                  <Link href="/demo" className="text-foreground underline">
                    /demo
                  </Link>
                  .
                </li>
                <li>
                  3. (Optionnel) Lancer la simulation pour alimenter incidents
                  et positions.
                </li>
                <li>
                  4. Surveiller les événements et tester les propositions
                  d’affectation.
                </li>
              </ol>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
