import { useMemo, useState } from "react";
import { useIPL } from "@/store/ipl-context";
import { ChartCard } from "@/components/ipl/ChartCard";
import { BarChartBlock, CHART_COLORS } from "@/components/ipl/charts";
import { headToHeadDetail, teamSummary, uniqueValues } from "@/lib/analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Crown, Flame, Target, Trophy, Zap } from "lucide-react";

const COLOR_A = CHART_COLORS.primary;
const COLOR_B = CHART_COLORS.orange;

export function CompareMode() {
  const { filtered, matches } = useIPL();
  const teams = useMemo(() => uniqueValues(matches, "team1").sort(), [matches]);
  const [a, setA] = useState(teams[0] ?? "");
  const [b, setB] = useState(teams[1] ?? "");

  const detail = useMemo(() => headToHeadDetail(filtered.matches, filtered.deliveries, a, b), [filtered, a, b]);
  const overallA = useMemo(() => teamSummary(filtered.matches, filtered.deliveries, a), [filtered, a]);
  const overallB = useMemo(() => teamSummary(filtered.matches, filtered.deliveries, b), [filtered, b]);

  if (!a || !b) return <div className="panel p-8 text-center text-muted-foreground">Need at least two teams.</div>;

  const winPctA = detail.games ? (detail.aWins / detail.games) * 100 : 0;
  const winPctB = detail.games ? (detail.bWins / detail.games) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="panel p-5">
        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <TeamPicker label="Team A" value={a} options={teams} onChange={setA} color={COLOR_A} />
          <button
            onClick={() => { const t = a; setA(b); setB(t); }}
            className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-primary"
            aria-label="Swap"
          ><ArrowLeftRight className="h-4 w-4" /></button>
          <TeamPicker label="Team B" value={b} options={teams} onChange={setB} color={COLOR_B} />
        </div>
      </div>

      {/* Head-to-head headline */}
      <div className="panel p-6">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">Head-to-Head ({detail.games} games)</p>
        <div className="mt-4 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <SideBlock team={a} value={detail.aWins} label="wins" pct={winPctA} color={COLOR_A} align="right" />
          <div className="text-center">
            <div className="text-xs uppercase text-muted-foreground">VS</div>
          </div>
          <SideBlock team={b} value={detail.bWins} label="wins" pct={winPctB} color={COLOR_B} align="left" />
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-secondary">
          <div className="flex h-full">
            <div style={{ width: `${winPctA}%`, background: COLOR_A }} />
            <div style={{ width: `${winPctB}%`, background: COLOR_B }} />
          </div>
        </div>
      </div>

      {/* Side-by-side summary cards (in this matchup) */}
      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard title={`${a} · in this matchup`} s={detail.summaryA} color={COLOR_A} toss={detail.tossA} />
        <SummaryCard title={`${b} · in this matchup`} s={detail.summaryB} color={COLOR_B} toss={detail.tossB} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Wins by Season" subtitle="In their head-to-head meetings">
          <BarChartBlock data={detail.bySeason} xKey="season" bars={[
            { key: a, color: COLOR_A, name: a },
            { key: b, color: COLOR_B, name: b },
          ]} height={280} />
        </ChartCard>
        <ChartCard title="Wins by Venue" subtitle="Top grounds they've met at">
          {detail.byVenue.length ? (
            <BarChartBlock data={detail.byVenue} xKey="venue" bars={[
              { key: a, color: COLOR_A, name: a },
              { key: b, color: COLOR_B, name: b },
            ]} height={280} />
          ) : <Empty />}
        </ChartCard>
      </div>

      {/* Overall comparison stat table */}
      <ChartCard title="Overall Stats Comparison" subtitle="Across all filtered matches (not just head-to-head)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Metric</th>
                <th className="px-3 py-2 text-right" style={{ color: COLOR_A }}>{a}</th>
                <th className="px-3 py-2 text-center text-muted-foreground">vs</th>
                <th className="px-3 py-2 text-left" style={{ color: COLOR_B }}>{b}</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Matches" a={overallA.played} b={overallB.played} />
              <Row label="Wins" a={overallA.wins} b={overallB.wins} />
              <Row label="Win %" a={`${overallA.winPct.toFixed(1)}%`} b={`${overallB.winPct.toFixed(1)}%`} aNum={overallA.winPct} bNum={overallB.winPct} />
              <Row label="Total Runs" a={overallA.runs.toLocaleString()} b={overallB.runs.toLocaleString()} aNum={overallA.runs} bNum={overallB.runs} />
              <Row label="Wickets Taken" a={overallA.wickets} b={overallB.wickets} />
              <Row label="Sixes" a={overallA.sixes} b={overallB.sixes} />
              <Row label="Fours" a={overallA.fours} b={overallB.fours} />
              <Row label="Avg Innings Score" a={overallA.avgScore} b={overallB.avgScore} />
              <Row label="Highest Score" a={overallA.highScore} b={overallB.highScore} />
              <Row label="Top Batter" a={overallA.topBatter ? `${overallA.topBatter.name} (${overallA.topBatter.runs})` : "—"} b={overallB.topBatter ? `${overallB.topBatter.name} (${overallB.topBatter.runs})` : "—"} />
              <Row label="Top Bowler" a={overallA.topBowler ? `${overallA.topBowler.name} (${overallA.topBowler.wickets})` : "—"} b={overallB.topBowler ? `${overallB.topBowler.name} (${overallB.topBowler.wickets})` : "—"} />
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

function TeamPicker({ label, value, options, onChange, color }: { label: string; value: string; options: string[]; onChange: (v: string) => void; color: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-input border-2" style={{ borderColor: color }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{options.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function SideBlock({ team, value, label, pct, color, align }: { team: string; value: number; label: string; pct: number; color: string; align: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <p className="truncate text-sm font-bold" style={{ color }}>{team}</p>
      <p className="text-5xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs text-muted-foreground">{label} · {pct.toFixed(1)}%</p>
    </div>
  );
}

function SummaryCard({ title, s, color, toss }: { title: string; s: ReturnType<typeof teamSummary>; color: string; toss: number }) {
  return (
    <div className="panel p-5">
      <h4 className="truncate text-sm font-bold" style={{ color }}>{title}</h4>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Mini icon={<Trophy className="h-3.5 w-3.5" />} label="Wins" value={`${s.wins}/${s.played}`} />
        <Mini icon={<Crown className="h-3.5 w-3.5" />} label="Win %" value={`${s.winPct.toFixed(1)}%`} />
        <Mini icon={<Zap className="h-3.5 w-3.5" />} label="Runs" value={s.runs.toLocaleString()} />
        <Mini icon={<Target className="h-3.5 w-3.5" />} label="Wickets" value={s.wickets} />
        <Mini icon={<Flame className="h-3.5 w-3.5" />} label="Sixes" value={s.sixes} />
        <Mini icon={<Zap className="h-3.5 w-3.5" />} label="Fours" value={s.fours} />
        <Mini label="Avg score" value={s.avgScore} />
        <Mini label="Toss + win" value={toss} />
      </div>
      <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
        <div className="flex justify-between gap-2"><span className="text-muted-foreground">Top batter</span><span className="truncate font-semibold">{s.topBatter ? `${s.topBatter.name} (${s.topBatter.runs})` : "—"}</span></div>
        <div className="flex justify-between gap-2"><span className="text-muted-foreground">Top bowler</span><span className="truncate font-semibold">{s.topBowler ? `${s.topBowler.name} (${s.topBowler.wickets})` : "—"}</span></div>
      </div>
    </div>
  );
}

function Mini({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-secondary/60 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">{icon}{label}</div>
      <div className="mt-0.5 text-base font-bold">{value}</div>
    </div>
  );
}

function Row({ label, a, b, aNum, bNum }: { label: string; a: React.ReactNode; b: React.ReactNode; aNum?: number; bNum?: number }) {
  const aWin = aNum !== undefined && bNum !== undefined && aNum > bNum;
  const bWin = aNum !== undefined && bNum !== undefined && bNum > aNum;
  return (
    <tr className="border-t border-border">
      <td className="px-3 py-2 text-muted-foreground">{label}</td>
      <td className={`px-3 py-2 text-right font-semibold ${aWin ? "text-primary" : ""}`}>{a}</td>
      <td className="px-3 py-2 text-center text-xs text-muted-foreground">·</td>
      <td className={`px-3 py-2 text-left font-semibold ${bWin ? "text-orange" : ""}`}>{b}</td>
    </tr>
  );
}

function Empty() {
  return <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">No meetings in current filter.</div>;
}
