import { createFileRoute } from "@tanstack/react-router";
import { IPLProvider } from "@/store/ipl-context";
import { UploadBar } from "@/components/ipl/UploadBar";
import { FiltersBar } from "@/components/ipl/FiltersBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewSection } from "@/components/ipl/sections/OverviewSection";
import { PlayerSection } from "@/components/ipl/sections/PlayerSection";
import { TeamSection } from "@/components/ipl/sections/TeamSection";
import { MatchSection } from "@/components/ipl/sections/MatchSection";
import { VenueSection } from "@/components/ipl/sections/VenueSection";
import { CompareMode } from "@/components/ipl/sections/CompareMode";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IPL Analytics Dashboard 2008–2019" },
      { name: "description", content: "Interactive analytics across 12 IPL seasons: teams, players, venues, and matches." },
      { property: "og:title", content: "IPL Analytics Dashboard 2008–2019" },
      { property: "og:description", content: "Interactive analytics across 12 IPL seasons." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <IPLProvider>
      <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-8">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-orange text-primary-foreground font-black shadow-lg">
              IPL
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">IPL Analytics Dashboard</h1>
              <p className="text-xs text-muted-foreground">Seasons 2008 – 2019 · Built with React + Recharts</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline">
            Production preview
          </span>
        </header>

        <UploadBar />
        <FiltersBar />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-card border border-border p-1 h-auto flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><OverviewSection /></TabsContent>
          <TabsContent value="players"><PlayerSection /></TabsContent>
          <TabsContent value="teams"><TeamSection /></TabsContent>
          <TabsContent value="compare"><CompareMode /></TabsContent>
          <TabsContent value="matches"><MatchSection /></TabsContent>
          <TabsContent value="venues"><VenueSection /></TabsContent>
        </Tabs>

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Upload <code className="rounded bg-secondary px-1.5 py-0.5">matches.csv</code> & <code className="rounded bg-secondary px-1.5 py-0.5">deliveries.csv</code> (Kaggle IPL schema) to analyze real data.
        </footer>
      </div>
    </IPLProvider>
  );
}
