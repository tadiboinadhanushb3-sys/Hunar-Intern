import type { Match, Delivery } from "@/types/ipl";

const teams = [
  "Mumbai Indians", "Chennai Super Kings", "Royal Challengers Bangalore",
  "Kolkata Knight Riders", "Delhi Capitals", "Rajasthan Royals",
  "Sunrisers Hyderabad", "Kings XI Punjab",
];
const venues = [
  "Wankhede Stadium", "M. Chinnaswamy Stadium", "Eden Gardens",
  "MA Chidambaram Stadium", "Feroz Shah Kotla", "Sawai Mansingh Stadium",
  "Rajiv Gandhi International Stadium", "Punjab Cricket Association Stadium",
];
const cities = ["Mumbai", "Bangalore", "Kolkata", "Chennai", "Delhi", "Jaipur", "Hyderabad", "Mohali"];
const batsmen = ["V Kohli", "SK Raina", "RG Sharma", "DA Warner", "S Dhawan", "CH Gayle", "MS Dhoni", "AB de Villiers", "G Gambhir", "RV Uthappa", "KL Rahul", "AM Rahane"];
const bowlers = ["SL Malinga", "A Mishra", "PP Chawla", "Harbhajan Singh", "DJ Bravo", "B Kumar", "R Ashwin", "JJ Bumrah", "YS Chahal", "SP Narine"];
const dismissals = ["caught", "bowled", "lbw", "run out", "stumped"];

function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

export function generateSampleData(): { matches: Match[]; deliveries: Delivery[] } {
  const r = rng(42);
  const matches: Match[] = [];
  const deliveries: Delivery[] = [];
  let mid = 1;
  for (let season = 2008; season <= 2019; season++) {
    const numMatches = 50 + Math.floor(r() * 10);
    for (let m = 0; m < numMatches; m++) {
      const t1 = teams[Math.floor(r() * teams.length)];
      let t2 = teams[Math.floor(r() * teams.length)];
      while (t2 === t1) t2 = teams[Math.floor(r() * teams.length)];
      const venueIdx = Math.floor(r() * venues.length);
      const winner = r() > 0.5 ? t1 : t2;
      const tossWinner = r() > 0.5 ? t1 : t2;
      matches.push({
        id: mid,
        season,
        city: cities[venueIdx],
        date: `${season}-04-${String((m % 28) + 1).padStart(2, "0")}`,
        team1: t1, team2: t2,
        toss_winner: tossWinner,
        toss_decision: r() > 0.5 ? "bat" : "field",
        result: "normal",
        winner,
        win_by_runs: r() > 0.5 ? Math.floor(r() * 80) : 0,
        win_by_wickets: r() > 0.5 ? Math.floor(r() * 9) + 1 : 0,
        player_of_match: batsmen[Math.floor(r() * batsmen.length)],
        venue: venues[venueIdx],
      });

      // Generate ~30 deliveries per match (sample, not full 240)
      for (let inning = 1; inning <= 2; inning++) {
        const batting = inning === 1 ? t1 : t2;
        const bowling = inning === 1 ? t2 : t1;
        for (let over = 0; over < 20; over++) {
          for (let ball = 1; ball <= 6; ball++) {
            const runs = [0, 1, 1, 2, 0, 4, 0, 1, 6, 0][Math.floor(r() * 10)];
            const isWicket = r() < 0.04;
            deliveries.push({
              match_id: mid, inning, batting_team: batting, bowling_team: bowling,
              over, ball,
              batsman: batsmen[Math.floor(r() * batsmen.length)],
              bowler: bowlers[Math.floor(r() * bowlers.length)],
              wide_runs: 0, bye_runs: 0, legbye_runs: 0, noball_runs: 0, penalty_runs: 0,
              batsman_runs: runs, extra_runs: 0, total_runs: runs,
              player_dismissed: isWicket ? batsmen[Math.floor(r() * batsmen.length)] : undefined,
              dismissal_kind: isWicket ? dismissals[Math.floor(r() * dismissals.length)] : undefined,
            });
          }
        }
      }
      mid++;
    }
  }
  return { matches, deliveries };
}
