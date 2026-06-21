import { useIPL } from "@/store/ipl-context";
import { ChartCard } from "@/components/ipl/ChartCard";
import { BarChartBlock } from "@/components/ipl/charts";
import { CHART_COLORS } from "@/components/ipl/charts";
import { runsPerOver } from "@/lib/analytics";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MatchSection() {
  const { filtered } = useIPL();
  const matches = filtered.matches.slice(0, 200);
  const [matchId, setMatchId] = useState<number>(matches[0]?.id ?? 0);
  const match = matches.find((m) => m.id === matchId) ?? matches[0];
  const rpo = useMemo(() => match ? runsPerOver(filtered.deliveries, match.id) : [], [filtered.deliveries, match]);

  const scorecard = useMemo(() => {
    if (!match) return [];
    return [1, 2].map((inn) => {
      const ds = filtered.deliveries.filter((d) => d.match_id === match.id && d.inning === inn);
      const team = ds[0]?.batting_team ?? "—";
      const runs = ds.reduce((s, d) => s + d.total_runs, 0);
      const wickets = ds.filter((d) => d.player_dismissed).length;
      const overs = ds.length ? `${Math.floor(ds.length / 6)}.${ds.length % 6}` : "0.0";
      return { inning: inn, team, runs, wickets, overs };
    });
  }, [filtered.deliveries, match]);

  if (!match) return <div className="panel p-8 text-center text-muted-foreground">No matches in current filter.</div>;

  return (
    <div className="space-y-6">
      <div className="panel p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="min-w-0">
            <p className="text-xs uppercase text-muted-foreground">Match</p>
            <h3 className="truncate text-lg font-bold">{match.team1} vs {match.team2}</h3>
            <p className="text-xs text-muted-foreground">{match.date} · {match.venue} · Winner: <span className="text-primary font-semibold">{match.winner}</span></p>
          </div>
          <Select value={String(matchId)} onValueChange={(v) => setMatchId(Number(v))}>
            <SelectTrigger className="w-[280px] bg-input"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {matches.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.season} · {m.team1} vs {m.team2}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Scorecard">
          <div className="space-y-3">
            {scorecard.map((s) => (
              <div key={s.inning} className="rounded-lg bg-secondary/60 p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Innings {s.inning}</p>
                    <p className="text-lg font-bold">{s.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary">{s.runs}<span className="text-lg text-muted-foreground">/{s.wickets}</span></p>
                    <p className="text-xs text-muted-foreground">{s.overs} overs</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Runs Per Over" subtitle="Both innings">
          <BarChartBlock data={rpo} xKey="over" bars={[
            { key: "inning1", color: CHART_COLORS.primary, name: scorecard[0]?.team ?? "Inn 1" },
            { key: "inning2", color: CHART_COLORS.orange, name: scorecard[1]?.team ?? "Inn 2" },
          ]} height={300} />
        </ChartCard>
      </div>
    </div>
  );
}
