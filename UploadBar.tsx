import { useRef, useState } from "react";
import { useIPL } from "@/store/ipl-context";
import { parseDeliveriesCSV, parseMatchesCSV } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Upload, Database, CheckCircle2 } from "lucide-react";

export function UploadBar() {
  const { setMatches, setDeliveries, loadSample, isSample, matches, deliveries } = useIPL();
  const matchesRef = useRef<HTMLInputElement>(null);
  const deliveriesRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="panel flex flex-wrap items-center gap-3 p-4">
      <div className="flex items-center gap-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
          <Database className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold">Data source</p>
          <p className="text-xs text-muted-foreground">
            {isSample ? "Using sample IPL data (2008–2019)" : `${matches.length} matches · ${deliveries.length.toLocaleString()} deliveries loaded`}
          </p>
        </div>
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        <input ref={matchesRef} type="file" accept=".csv" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          try { setMatches(await parseMatchesCSV(f)); setErr(null); } catch (err) { setErr(`matches.csv: ${(err as Error).message}`); }
        }} />
        <input ref={deliveriesRef} type="file" accept=".csv" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          try { setDeliveries(await parseDeliveriesCSV(f)); setErr(null); } catch (err) { setErr(`deliveries.csv: ${(err as Error).message}`); }
        }} />
        <Button variant="outline" size="sm" onClick={() => matchesRef.current?.click()}>
          <Upload className="h-4 w-4" /> matches.csv
        </Button>
        <Button variant="outline" size="sm" onClick={() => deliveriesRef.current?.click()}>
          <Upload className="h-4 w-4" /> deliveries.csv
        </Button>
        <Button variant="ghost" size="sm" onClick={loadSample}>
          <CheckCircle2 className="h-4 w-4" /> Use sample
        </Button>
      </div>
      {err && <p className="basis-full text-xs text-destructive">{err}</p>}
    </div>
  );
}
