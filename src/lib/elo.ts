/**
 * Elo Rating Calculation Engine for My8ball
 * Designed specifically for competitive 8-ball pool with provisional K-factors,
 * frame-margin scaling, and competitive division tiers.
 */

export interface RatingResult {
  player1NewRating: number;
  player2NewRating: number;
  player1Change: number;
  player2Change: number;
}

export function getDivision(rating: number): string {
  if (rating < 1200) return "ROOKIE";
  if (rating < 1350) return "BRONZE";
  if (rating < 1500) return "SILVER";
  if (rating < 1650) return "GOLD";
  if (rating < 1800) return "PLATINUM";
  if (rating < 1950) return "DIAMOND";
  if (rating < 2100) return "CHAMPION";
  return "ELITE";
}

export function getDivisionColor(division: string): { bg: string; text: string; border: string; glow: string } {
  switch (division) {
    case "ROOKIE":
      return { bg: "bg-zinc-800", text: "text-zinc-300", border: "border-zinc-700", glow: "shadow-none" };
    case "BRONZE":
      return { bg: "bg-amber-950/60", text: "text-amber-400", border: "border-amber-700/50", glow: "shadow-amber-900/20" };
    case "SILVER":
      return { bg: "bg-slate-800", text: "text-slate-200", border: "border-slate-500/50", glow: "shadow-slate-500/20" };
    case "GOLD":
      return { bg: "bg-yellow-950/50", text: "text-yellow-400", border: "border-yellow-500/60", glow: "shadow-yellow-500/30" };
    case "PLATINUM":
      return { bg: "bg-cyan-950/50", text: "text-cyan-300", border: "border-cyan-500/60", glow: "shadow-cyan-500/30" };
    case "DIAMOND":
      return { bg: "bg-blue-950/60", text: "text-blue-300", border: "border-blue-400/70", glow: "shadow-blue-500/40" };
    case "CHAMPION":
      return { bg: "bg-purple-950/60", text: "text-purple-300", border: "border-purple-400/70", glow: "shadow-purple-500/40" };
    case "ELITE":
      return { bg: "bg-emerald-950/60", text: "text-emerald-300", border: "border-emerald-400/80", glow: "shadow-emerald-500/50" };
    default:
      return { bg: "bg-zinc-800", text: "text-zinc-300", border: "border-zinc-700", glow: "shadow-none" };
  }
}

/**
 * Determine dynamic K-factor based on player experience:
 * - Provisional players (<15 matches): K = 40 (faster calibration)
 * - Established players: K = 24
 * - Master/Elite tier (>1800 rating): K = 16 (high stability)
 */
export function getKFactor(matchesPlayed: number, rating: number): number {
  if (matchesPlayed < 15) return 40;
  if (rating >= 1800) return 16;
  return 24;
}

/**
 * Calculate expected win probability using logistic formula
 */
export function getExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate Elo rating adjustment after an official match result
 * @param r1 Rating of Player 1
 * @param r2 Rating of Player 2
 * @param score1 Frames won by Player 1
 * @param score2 Frames won by Player 2
 * @param matches1 Historical matches played by Player 1
 * @param matches2 Historical matches played by Player 2
 */
export function calculateMatchElo(
  r1: number,
  r2: number,
  score1: number,
  score2: number,
  matches1: number,
  matches2: number
): RatingResult {
  const expected1 = getExpectedScore(r1, r2);
  const expected2 = 1 - expected1;

  // Actual match outcome: 1 if Player 1 won, 0 if Player 2 won
  const actual1 = score1 > score2 ? 1 : 0;
  const actual2 = 1 - actual1;

  // Margin of victory multiplier for pool frames (e.g. 5-0 clearance vs 5-4 hill-hill)
  const totalFrames = Math.max(score1 + score2, 1);
  const frameDiff = Math.abs(score1 - score2);
  const marginMultiplier = Math.min(1 + frameDiff / (totalFrames * 2), 1.35);

  const k1 = getKFactor(matches1, r1);
  const k2 = getKFactor(matches2, r2);

  const change1 = Math.round(k1 * (actual1 - expected1) * marginMultiplier);
  const change2 = Math.round(k2 * (actual2 - expected2) * marginMultiplier);

  // New ratings with minimum floor at 800
  const player1NewRating = Math.max(800, Math.round(r1 + change1));
  const player2NewRating = Math.max(800, Math.round(r2 + change2));

  return {
    player1NewRating,
    player2NewRating,
    player1Change: change1,
    player2Change: change2,
  };
}
