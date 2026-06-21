export interface Match {
  id: number;
  season: number;
  city: string;
  date: string;
  team1: string;
  team2: string;
  toss_winner: string;
  toss_decision: string;
  result: string;
  winner: string;
  win_by_runs: number;
  win_by_wickets: number;
  player_of_match: string;
  venue: string;
}

export interface Delivery {
  match_id: number;
  inning: number;
  batting_team: string;
  bowling_team: string;
  over: number;
  ball: number;
  batsman: string;
  bowler: string;
  is_super_over?: number;
  wide_runs: number;
  bye_runs: number;
  legbye_runs: number;
  noball_runs: number;
  penalty_runs: number;
  batsman_runs: number;
  extra_runs: number;
  total_runs: number;
  player_dismissed?: string;
  dismissal_kind?: string;
}

export interface Filters {
  season: number | "all";
  team: string | "all";
  venue: string | "all";
  player: string | "all";
}
