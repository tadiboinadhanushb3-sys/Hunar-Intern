import type { Match, Delivery, Filters } from "@/types/ipl";

export function applyFilters(matches: Match[], deliveries: Delivery[], f: Filters) {
  let m = matches;
  if (f.season !== "all") m = m.filter((x) => x.season === f.season);
  if (f.team !== "all") m = m.filter((x) => x.team1 === f.team || x.team2 === f.team);
  if (f.venue !== "all") m = m.filter((x) => x.venue === f.venue);
  const ids = new Set(m.map((x) => x.id));
  let d = deliveries.filter((x) => ids.has(x.match_id));
  if (f.player !== "all") d = d.filter((x) => x.batsman === f.player || x.bowler === f.player || x.player_dismissed === f.player);
  return { matches: m, deliveries: d };
}

export function overviewStats(matches: Match[], deliveries: Delivery[]) {
  const totalRuns = deliveries.reduce((s, d) => s + d.total_runs, 0);
  const totalWickets = deliveries.filter((d) => d.player_dismissed).length;
  const sixes = deliveries.filter((d) => d.batsman_runs === 6).length;
  const fours = deliveries.filter((d) => d.batsman_runs === 4).length;
  // highest team score: group by match+inning+batting_team
  const scoreMap = new Map<string, number>();
  for (const d of deliveries) {
    const k = `${d.match_id}|${d.inning}|${d.batting_team}`;
    scoreMap.set(k, (scoreMap.get(k) ?? 0) + d.total_runs);
  }
  let highest = { team: "-", score: 0 };
  for (const [k, v] of scoreMap) {
    if (v > highest.score) highest = { team: k.split("|")[2], score: v };
  }
  return { totalMatches: matches.length, totalRuns, totalWickets, sixes, fours, highest };
}

export function bySeason<T extends keyof ReturnType<typeof seasonAgg>>(matches: Match[], deliveries: Delivery[]) {
  return seasonAgg(matches, deliveries);
}
function seasonAgg(matches: Match[], deliveries: Delivery[]) {
  const map = new Map<number, { season: number; matches: number; runs: number; wickets: number }>();
  for (const m of matches) {
    const e = map.get(m.season) ?? { season: m.season, matches: 0, runs: 0, wickets: 0 };
    e.matches++;
    map.set(m.season, e);
  }
  for (const d of deliveries) {
    const m = matches.find((x) => x.id === d.match_id);
    if (!m) continue;
    const e = map.get(m.season)!;
    e.runs += d.total_runs;
    if (d.player_dismissed) e.wickets++;
  }
  return Array.from(map.values()).sort((a, b) => a.season - b.season);
}

export function seasonWinners(matches: Match[]) {
  // simplistic: most wins per season
  const map = new Map<number, Map<string, number>>();
  for (const m of matches) {
    if (!m.winner) continue;
    const seasonMap = map.get(m.season) ?? new Map();
    seasonMap.set(m.winner, (seasonMap.get(m.winner) ?? 0) + 1);
    map.set(m.season, seasonMap);
  }
  return Array.from(map.entries()).map(([season, teamMap]) => {
    let top = { team: "-", wins: 0 };
    for (const [team, wins] of teamMap) if (wins > top.wins) top = { team, wins };
    return { season, winner: top.team, wins: top.wins };
  }).sort((a, b) => a.season - b.season);
}

export function topRunScorers(deliveries: Delivery[], n = 10) {
  const map = new Map<string, { runs: number; balls: number; fours: number; sixes: number }>();
  for (const d of deliveries) {
    const e = map.get(d.batsman) ?? { runs: 0, balls: 0, fours: 0, sixes: 0 };
    e.runs += d.batsman_runs;
    if (!d.wide_runs && !d.noball_runs) e.balls++;
    if (d.batsman_runs === 4) e.fours++;
    if (d.batsman_runs === 6) e.sixes++;
    map.set(d.batsman, e);
  }
  return Array.from(map.entries()).map(([name, v]) => ({ name, ...v, sr: v.balls ? (v.runs / v.balls) * 100 : 0 }))
    .sort((a, b) => b.runs - a.runs).slice(0, n);
}

export function topWicketTakers(deliveries: Delivery[], n = 10) {
  const map = new Map<string, number>();
  for (const d of deliveries) {
    if (d.player_dismissed && d.dismissal_kind !== "run out") {
      map.set(d.bowler, (map.get(d.bowler) ?? 0) + 1);
    }
  }
  return Array.from(map.entries()).map(([name, wickets]) => ({ name, wickets }))
    .sort((a, b) => b.wickets - a.wickets).slice(0, n);
}

export function teamWinPct(matches: Match[]) {
  const map = new Map<string, { team: string; played: number; won: number }>();
  for (const m of matches) {
    for (const t of [m.team1, m.team2]) {
      const e = map.get(t) ?? { team: t, played: 0, won: 0 };
      e.played++;
      if (m.winner === t) e.won++;
      map.set(t, e);
    }
  }
  return Array.from(map.values()).map((e) => ({ ...e, winPct: e.played ? (e.won / e.played) * 100 : 0 }))
    .sort((a, b) => b.winPct - a.winPct);
}

export function venueStats(matches: Match[], deliveries: Delivery[]) {
  const map = new Map<string, { venue: string; matches: number; totalRuns: number; innings: number }>();
  for (const m of matches) {
    const e = map.get(m.venue) ?? { venue: m.venue, matches: 0, totalRuns: 0, innings: 0 };
    e.matches++;
    map.set(m.venue, e);
  }
  const innMap = new Map<string, number>();
  for (const d of deliveries) {
    const m = matches.find((x) => x.id === d.match_id);
    if (!m) continue;
    const e = map.get(m.venue)!;
    e.totalRuns += d.total_runs;
    innMap.set(`${d.match_id}|${d.inning}|${m.venue}`, 1);
  }
  for (const k of innMap.keys()) {
    const v = k.split("|")[2];
    const e = map.get(v); if (e) e.innings++;
  }
  return Array.from(map.values()).map((e) => ({
    venue: e.venue, matches: e.matches,
    avgScore: e.innings ? Math.round(e.totalRuns / e.innings) : 0,
  })).sort((a, b) => b.matches - a.matches);
}

export function tossImpact(matches: Match[]) {
  let tossWon = 0, matchWon = 0;
  for (const m of matches) { if (m.toss_winner) { tossWon++; if (m.toss_winner === m.winner) matchWon++; } }
  return { tossWon, matchWon, pct: tossWon ? (matchWon / tossWon) * 100 : 0 };
}

export function runsPerOver(deliveries: Delivery[], matchId: number) {
  const innings = new Map<number, Map<number, number>>();
  for (const d of deliveries.filter((x) => x.match_id === matchId)) {
    const ov = innings.get(d.inning) ?? new Map();
    ov.set(d.over, (ov.get(d.over) ?? 0) + d.total_runs);
    innings.set(d.inning, ov);
  }
  const result: { over: number; inning1: number; inning2: number }[] = [];
  for (let o = 0; o < 20; o++) {
    result.push({
      over: o + 1,
      inning1: innings.get(1)?.get(o) ?? 0,
      inning2: innings.get(2)?.get(o) ?? 0,
    });
  }
  return result;
}

export function headToHead(matches: Match[], teamA: string, teamB: string) {
  const games = matches.filter((m) =>
    (m.team1 === teamA && m.team2 === teamB) || (m.team1 === teamB && m.team2 === teamA),
  );
  const aWins = games.filter((m) => m.winner === teamA).length;
  const bWins = games.filter((m) => m.winner === teamB).length;
  return { total: games.length, aWins, bWins };
}

export function uniqueValues<T, K extends keyof T>(arr: T[], key: K): T[K][] {
  return Array.from(new Set(arr.map((x) => x[key]))).filter(Boolean) as T[K][];
}

export function teamSummary(matches: Match[], deliveries: Delivery[], team: string) {
  const played = matches.filter((m) => m.team1 === team || m.team2 === team);
  const wins = played.filter((m) => m.winner === team).length;
  const batting = deliveries.filter((d) => d.batting_team === team);
  const bowling = deliveries.filter((d) => d.bowling_team === team);
  const runs = batting.reduce((s, d) => s + d.total_runs, 0);
  const sixes = batting.filter((d) => d.batsman_runs === 6).length;
  const fours = batting.filter((d) => d.batsman_runs === 4).length;
  const wickets = bowling.filter((d) => d.player_dismissed && d.dismissal_kind !== "run out").length;

  // innings scores
  const innMap = new Map<string, number>();
  for (const d of batting) {
    const k = `${d.match_id}|${d.inning}`;
    innMap.set(k, (innMap.get(k) ?? 0) + d.total_runs);
  }
  const scores = Array.from(innMap.values());
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highScore = scores.length ? Math.max(...scores) : 0;

  // top batter/bowler
  const batMap = new Map<string, number>();
  for (const d of batting) batMap.set(d.batsman, (batMap.get(d.batsman) ?? 0) + d.batsman_runs);
  const topBatter = [...batMap.entries()].sort((a, b) => b[1] - a[1])[0];

  const bowlMap = new Map<string, number>();
  for (const d of bowling) if (d.player_dismissed && d.dismissal_kind !== "run out") bowlMap.set(d.bowler, (bowlMap.get(d.bowler) ?? 0) + 1);
  const topBowler = [...bowlMap.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    team, played: played.length, wins, winPct: played.length ? (wins / played.length) * 100 : 0,
    runs, wickets, sixes, fours, avgScore, highScore,
    topBatter: topBatter ? { name: topBatter[0], runs: topBatter[1] } : null,
    topBowler: topBowler ? { name: topBowler[0], wickets: topBowler[1] } : null,
  };
}

export function headToHeadDetail(matches: Match[], deliveries: Delivery[], a: string, b: string) {
  const games = matches.filter((m) =>
    (m.team1 === a && m.team2 === b) || (m.team1 === b && m.team2 === a),
  );
  const ids = new Set(games.map((g) => g.id));
  const gameDeliveries = deliveries.filter((d) => ids.has(d.match_id));

  // wins by season
  const seasons = Array.from(new Set(games.map((g) => g.season))).sort((x, y) => x - y);
  const bySeason = seasons.map((season) => {
    const s = games.filter((g) => g.season === season);
    return {
      season,
      [a]: s.filter((g) => g.winner === a).length,
      [b]: s.filter((g) => g.winner === b).length,
    };
  });

  // wins by venue
  const venueMap = new Map<string, { venue: string; [k: string]: number | string }>();
  for (const g of games) {
    const e = venueMap.get(g.venue) ?? { venue: g.venue, [a]: 0, [b]: 0 };
    if (g.winner === a) e[a] = (e[a] as number) + 1;
    if (g.winner === b) e[b] = (e[b] as number) + 1;
    venueMap.set(g.venue, e);
  }
  const byVenue = Array.from(venueMap.values()).slice(0, 8);

  // toss decision wins
  const tossA = games.filter((g) => g.toss_winner === a && g.winner === a).length;
  const tossB = games.filter((g) => g.toss_winner === b && g.winner === b).length;

  return {
    games: games.length,
    aWins: games.filter((g) => g.winner === a).length,
    bWins: games.filter((g) => g.winner === b).length,
    summaryA: teamSummary(games, gameDeliveries, a),
    summaryB: teamSummary(games, gameDeliveries, b),
    bySeason, byVenue, tossA, tossB,
  };
}
