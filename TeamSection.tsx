import { useIPL } from "@/store/ipl-context";
import { ChartCard } from "@/components/ipl/ChartCard";
import { BarChartBlock } from "@/components/ipl/charts";
import { CHART_COLORS } from "@/components/ipl/charts";
import { headToHead, teamWinPct, uniqueValues } from "@/lib/analytics";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TeamSection() {
  const { filtered, matches } = useIPL();
  const ranking = useMemo(() => teamWinPct(filtered.matches), [filtered.matches]);
  const teams = useMemo(() => uniqueValues(matches, "team1").sort(), [matches]);
  const [a, setA] = useState(teams[0] ?? "");
  const [b, setB] = useState(teams[1] ?? "");
  const h2h = useMemo(() => headToHead(filtered.matches, a, b), [filtered.matches, a, b]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Team Win %" subtitle="Across filtered matches">
          <BarChartBlock data={ranking} xKey="team" bars={[{ key: "winPct", color: CHART_COLORS.primary, name: "Win %" }]} height={320} />
        </ChartCard>

        <ChartCard title="Team Rankings">
          <div className="space-y-2">
            {ranking.map((r, i) => (
              <div key={r.team} className="flex items-center gap-3 rounded-md bg-secondary/60 px-3 py-2 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-black text-primary">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{r.team}</span>
                <span className="text-xs text-muted-foreground">{r.won}/{r.played}</span>
                <span className="w-14 text-right font-bold text-primary">{r.winPct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Head-to-Head" subtitle="Compare two franchises">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-2">
            <Select value={a} onValueChange={setA}>
              <SelectTrigger className="bg-input"><SelectValue /></SelectTrigger>
              <SelectContent>{teams.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <div className="rounded-lg bg-gradient-to-br from-primary/20 to-transparent p-6 text-center">
              <div className="text-5xl font-black text-primary">{h2h.aWins}</div>
              <div className="text-xs text-muted-foreground">wins</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase text-muted-foreground">Total games</div>
            <div className="text-3xl font-black">{h2h.total}</div>
            <div className="mt-1 text-xs text-muted-foreground">vs</div>
          </div>
          <div className="space-y-2">
            <Select value={b} onValueChange={setB}>
              <SelectTrigger className="bg-input"><SelectValue /></SelectTrigger>
              <SelectContent>{teams.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <div className="rounded-lg bg-gradient-to-br from-orange/20 to-transparent p-6 text-center">
              <div className="text-5xl font-black text-orange">{h2h.bWins}</div>
              <div className="text-xs text-muted-foreground">wins</div>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
