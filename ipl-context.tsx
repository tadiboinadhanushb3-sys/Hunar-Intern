import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Match, Delivery, Filters } from "@/types/ipl";
import { generateSampleData } from "@/lib/sample-data";
import { applyFilters } from "@/lib/analytics";

interface Ctx {
  matches: Match[];
  deliveries: Delivery[];
  setMatches: (m: Match[]) => void;
  setDeliveries: (d: Delivery[]) => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  filtered: { matches: Match[]; deliveries: Delivery[] };
  loadSample: () => void;
  reset: () => void;
  isSample: boolean;
}

const IPLContext = createContext<Ctx | null>(null);

export function IPLProvider({ children }: { children: ReactNode }) {
  const sample = useMemo(() => generateSampleData(), []);
  const [matches, setMatches] = useState<Match[]>(sample.matches);
  const [deliveries, setDeliveries] = useState<Delivery[]>(sample.deliveries);
  const [isSample, setIsSample] = useState(true);
  const [filters, setFilters] = useState<Filters>({ season: "all", team: "all", venue: "all", player: "all" });

  const filtered = useMemo(() => applyFilters(matches, deliveries, filters), [matches, deliveries, filters]);

  return (
    <IPLContext.Provider value={{
      matches, deliveries,
      setMatches: (m) => { setMatches(m); setIsSample(false); },
      setDeliveries: (d) => { setDeliveries(d); setIsSample(false); },
      filters, setFilters, filtered,
      loadSample: () => { setMatches(sample.matches); setDeliveries(sample.deliveries); setIsSample(true); },
      reset: () => setFilters({ season: "all", team: "all", venue: "all", player: "all" }),
      isSample,
    }}>
      {children}
    </IPLContext.Provider>
  );
}

export function useIPL() {
  const c = useContext(IPLContext);
  if (!c) throw new Error("useIPL must be used within IPLProvider");
  return c;
}
