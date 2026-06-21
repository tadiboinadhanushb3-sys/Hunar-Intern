import { useIPL } from "@/store/ipl-context";
import { uniqueValues } from "@/lib/analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { exportCSV } from "@/lib/csv";
import { useMemo } from "react";
import { Download, RotateCcw } from "lucide-react";

export function FiltersBar() {
  const { matches, deliveries, filters, setFilters, filtered, reset } = useIPL();

  const seasons = useMemo(() => uniqueValues(matches, "season").sort((a, b) => a - b), [matches]);
  const teams = useMemo(() => uniqueValues(matches, "team1").sort(), [matches]);
  const venues = useMemo(() => uniqueValues(matches, "venue").sort(), [matches]);
  const players = useMemo(() => Array.from(new Set(deliveries.map((d) => d.batsman))).sort().slice(0, 200), [deliveries]);

  return (
    <div className="panel flex flex-wrap items-end gap-3 p-4">
      <FilterSelect
        label="Season"
        value={String(filters.season)}
        onChange={(v) => setFilters({ ...filters, season: v === "all" ? "all" : Number(v) })}
        options={[{ value: "all", label: "All seasons" }, ...seasons.map((s) => ({ value: String(s), label: String(s) }))]}
      />
      <FilterSelect
        label="Team"
        value={filters.team}
        onChange={(v) => setFilters({ ...filters, team: v })}
        options={[{ value: "all", label: "All teams" }, ...teams.map((t) => ({ value: t, label: t }))]}
      />
      <FilterSelect
        label="Venue"
        value={filters.venue}
        onChange={(v) => setFilters({ ...filters, venue: v })}
        options={[{ value: "all", label: "All venues" }, ...venues.map((t) => ({ value: t, label: t }))]}
      />
      <FilterSelect
        label="Player"
        value={filters.player}
        onChange={(v) => setFilters({ ...filters, player: v })}
        options={[{ value: "all", label: "All players" }, ...players.map((t) => ({ value: t, label: t }))]}
      />
      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportCSV("matches_filtered.csv", filtered.matches as unknown as Record<string, unknown>[])}>
          <Download className="h-4 w-4" /> Matches
        </Button>
        <Button size="sm" onClick={() => exportCSV("deliveries_filtered.csv", filtered.deliveries as unknown as Record<string, unknown>[])}>
          <Download className="h-4 w-4" /> Deliveries
        </Button>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex min-w-[140px] flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 bg-input">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
