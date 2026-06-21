import Papa from "papaparse";
import type { Match, Delivery } from "@/types/ipl";

export function parseMatchesCSV(file: File): Promise<Match[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        try {
          const rows = res.data.map((r, i) => ({
            id: Number(r.id ?? r.match_id ?? i + 1),
            season: Number(r.season),
            city: r.city ?? "",
            date: r.date ?? "",
            team1: r.team1 ?? "",
            team2: r.team2 ?? "",
            toss_winner: r.toss_winner ?? "",
            toss_decision: r.toss_decision ?? "",
            result: r.result ?? "",
            winner: r.winner ?? "",
            win_by_runs: Number(r.win_by_runs ?? 0),
            win_by_wickets: Number(r.win_by_wickets ?? 0),
            player_of_match: r.player_of_match ?? "",
            venue: r.venue ?? "",
          })) as Match[];
          resolve(rows);
        } catch (e) { reject(e); }
      },
      error: reject,
    });
  });
}

export function parseDeliveriesCSV(file: File): Promise<Delivery[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        try {
          const rows = res.data.map((r) => ({
            match_id: Number(r.match_id),
            inning: Number(r.inning),
            batting_team: r.batting_team ?? "",
            bowling_team: r.bowling_team ?? "",
            over: Number(r.over),
            ball: Number(r.ball),
            batsman: r.batsman ?? "",
            bowler: r.bowler ?? "",
            wide_runs: Number(r.wide_runs ?? 0),
            bye_runs: Number(r.bye_runs ?? 0),
            legbye_runs: Number(r.legbye_runs ?? 0),
            noball_runs: Number(r.noball_runs ?? 0),
            penalty_runs: Number(r.penalty_runs ?? 0),
            batsman_runs: Number(r.batsman_runs ?? 0),
            extra_runs: Number(r.extra_runs ?? 0),
            total_runs: Number(r.total_runs ?? 0),
            player_dismissed: r.player_dismissed || undefined,
            dismissal_kind: r.dismissal_kind || undefined,
          })) as Delivery[];
          resolve(rows);
        } catch (e) { reject(e); }
      },
      error: reject,
    });
  });
}

export function exportCSV(filename: string, rows: Record<string, unknown>[]) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
