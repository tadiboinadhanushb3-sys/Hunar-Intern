import { useIPL } from "@/store/ipl-context";
import { ChartCard } from "@/components/ipl/ChartCard";
import { BarChartBlock } from "@/components/ipl/charts";
import { CHART_COLORS } from "@/components/ipl/charts";
import { venueStats } from "@/lib/analytics";
import { useMemo } from "react";

export function VenueSection() {
  const { filtered } = useIPL();
  const stats = useMemo(() => venueStats(filtered.matches, filtered.deliveries), [filtered]);
  const top = stats.slice(0, 12);

  // win pct by venue: % of matches won batting first
  const winFirst = useMemo(() => {
    const map = new Map<string, { venue: string; total: number; won: number }>();
    for (const m of filtered.matches) {
      const e = map.get(m.venue) ?? { venue: m.venue, total: 0, won: 0 };
      e.total++;
      if (m.win_by_runs > 0) e.won++;
      map.set(m.venue, e);
    }
    return Array.from(map.values()).map((e) => ({ venue: e.venue, pct: e.total ? +(e.won / e.total * 100).toFixed(1) : 0 }))
      .sort((a, b) => b.pct - a.pct).slice(0, 10);
  }, [filtered.matches]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Matches by Venue" subtitle="Most-hosted grounds">
          <BarChartBlock data={top} xKey="venue" bars={[{ key: "matches", color: CHART_COLORS.primary, name: "Matches" }]} height={320} />
        </ChartCard>
        <ChartCard title="Average Score by Venue" subtitle="Per innings">
          <BarChartBlock data={top} xKey="venue" bars={[{ key: "avgScore", color: CHART_COLORS.gold, name: "Avg" }]} height={320} />
        </ChartCard>
      </div>
      <ChartCard title="Batting First Win %" subtitle="By venue">
        <BarChartBlock data={winFirst} xKey="venue" bars={[{ key: "pct", color: CHART_COLORS.orange, name: "Win %" }]} height={300} />
      </ChartCard>
    </div>
  );
}
