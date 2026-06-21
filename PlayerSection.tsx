import { useIPL } from "@/store/ipl-context";
import { ChartCard } from "@/components/ipl/ChartCard";
import { BarChartBlock } from "@/components/ipl/charts";
import { CHART_COLORS } from "@/components/ipl/charts";
import { topRunScorers, topWicketTakers } from "@/lib/analytics";
import { useMemo } from "react";

export function PlayerSection() {
  const { filtered } = useIPL();
  const batters = useMemo(() => topRunScorers(filtered.deliveries, 10), [filtered.deliveries]);
  const bowlers = useMemo(() => topWicketTakers(filtered.deliveries, 10), [filtered.deliveries]);
  const orange = batters[0];
  const purple = bowlers[0];
  const srLeaders = useMemo(() => [...batters].filter((b) => b.balls > 30).sort((a, b) => b.sr - a.sr).slice(0, 8), [batters]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="stat-card p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange">🧢 Orange Cap</div>
          <p className="mt-3 text-2xl font-black">{orange?.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{orange?.runs ?? 0} runs · SR {orange?.sr.toFixed(1) ?? 0} · {orange?.sixes ?? 0} sixes</p>
        </div>
        <div className="stat-card p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple">🧢 Purple Cap</div>
          <p className="mt-3 text-2xl font-black">{purple?.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{purple?.wickets ?? 0} wickets</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Top Run Scorers" subtitle="Most runs in current filter">
          <BarChartBlock data={batters} xKey="name" bars={[{ key: "runs", color: CHART_COLORS.orange, name: "Runs" }]} height={320} />
        </ChartCard>
        <ChartCard title="Top Wicket Takers" subtitle="Most wickets in current filter">
          <BarChartBlock data={bowlers} xKey="name" bars={[{ key: "wickets", color: CHART_COLORS.purple, name: "Wickets" }]} height={320} />
        </ChartCard>
      </div>

      <ChartCard title="Strike Rate Leaders" subtitle="Minimum 30 balls faced">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Player</th><th className="px-3 py-2 text-right">Runs</th><th className="px-3 py-2 text-right">Balls</th><th className="px-3 py-2 text-right">4s</th><th className="px-3 py-2 text-right">6s</th><th className="px-3 py-2 text-right">SR</th></tr>
            </thead>
            <tbody>
              {srLeaders.map((p, i) => (
                <tr key={p.name} className="border-t border-border">
                  <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-2 font-semibold">{p.name}</td>
                  <td className="px-3 py-2 text-right">{p.runs}</td>
                  <td className="px-3 py-2 text-right">{p.balls}</td>
                  <td className="px-3 py-2 text-right">{p.fours}</td>
                  <td className="px-3 py-2 text-right">{p.sixes}</td>
                  <td className="px-3 py-2 text-right font-bold text-primary">{p.sr.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
