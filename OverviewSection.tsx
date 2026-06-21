import { useIPL } from "@/store/ipl-context";
import { StatCard } from "@/components/ipl/StatCard";
import { ChartCard } from "@/components/ipl/ChartCard";
import { BarChartBlock, LineChartBlock } from "@/components/ipl/charts";
import { CHART_COLORS } from "@/components/ipl/charts";
import { overviewStats, bySeason, seasonWinners, tossImpact } from "@/lib/analytics";
import { Trophy, Target, Zap, Activity, Flame, Crown } from "lucide-react";

export function OverviewSection() {
  const { filtered } = useIPL();
  const s = overviewStats(filtered.matches, filtered.deliveries);
  const season = bySeason(filtered.matches, filtered.deliveries);
  const winners = seasonWinners(filtered.matches);
  const toss = tossImpact(filtered.matches);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Matches" value={s.totalMatches} icon={<Trophy className="h-5 w-5" />} accent="primary" />
        <StatCard label="Total Runs" value={s.totalRuns.toLocaleString()} icon={<Activity className="h-5 w-5" />} accent="gold" />
        <StatCard label="Total Wickets" value={s.totalWickets.toLocaleString()} icon={<Target className="h-5 w-5" />} accent="purple" />
        <StatCard label="Sixes" value={s.sixes.toLocaleString()} icon={<Flame className="h-5 w-5" />} accent="orange" />
        <StatCard label="Fours" value={s.fours.toLocaleString()} icon={<Zap className="h-5 w-5" />} accent="primary" />
        <StatCard label="Highest Team Score" value={s.highest.score} hint={s.highest.team} icon={<Crown className="h-5 w-5" />} accent="gold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Matches & Wickets by Season" subtitle="Volume per IPL year">
          <BarChartBlock data={season} xKey="season" bars={[
            { key: "matches", color: CHART_COLORS.primary, name: "Matches" },
            { key: "wickets", color: CHART_COLORS.purple, name: "Wickets" },
          ]} />
        </ChartCard>
        <ChartCard title="Runs Trend by Season" subtitle="Total runs scored">
          <LineChartBlock data={season} xKey="season" lines={[{ key: "runs", color: CHART_COLORS.orange, name: "Runs" }]} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Season Winners" subtitle="Team with most wins per season">
          <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {winners.map((w) => (
              <div key={w.season} className="flex items-center justify-between rounded-md bg-secondary/60 px-3 py-2 text-sm">
                <span className="font-bold text-primary">{w.season}</span>
                <span className="min-w-0 flex-1 truncate px-3 text-foreground">{w.winner}</span>
                <span className="text-xs text-muted-foreground">{w.wins} wins</span>
              </div>
            ))}
            {winners.length === 0 && <p className="text-sm text-muted-foreground">No data.</p>}
          </div>
        </ChartCard>
        <ChartCard title="Toss Impact" subtitle="Does winning the toss matter?">
          <div className="flex h-full flex-col items-center justify-center gap-3 py-6">
            <div className="text-6xl font-black text-primary">{toss.pct.toFixed(1)}%</div>
            <p className="text-center text-sm text-muted-foreground">
              of toss winners also win the match<br />
              <span className="text-xs">({toss.matchWon} of {toss.tossWon})</span>
            </p>
          </div>
        </ChartCard>
        <ChartCard title="Season Activity" subtitle="Avg runs per match">
          <div className="space-y-3 pt-2">
            {season.map((s) => (
              <div key={s.season} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">{s.season}</span>
                  <span className="text-muted-foreground">{s.matches ? Math.round(s.runs / s.matches) : 0} runs/match</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-gradient-to-r from-primary to-orange" style={{ width: `${Math.min(100, (s.runs / Math.max(...season.map((x) => x.runs || 1))) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
