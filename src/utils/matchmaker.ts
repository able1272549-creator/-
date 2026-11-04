/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, MatchType } from '../types/badminton';

export interface MatchmakingResult {
  teamA: Player[];
  teamB: Player[];
  reason: string;
}

const SKILL_WEIGHT: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

/**
 * Calculates a priority score for queue ordering.
 * Lower score = higher priority to play next.
 */
function calculatePlayerPriority(player: Player, now: number): number {
  const waitTimeMs = Math.max(0, now - (player.restStartedAt || now));
  const waitMinutes = waitTimeMs / 60000;

  // Games played is the primary penalty (100 pts per game played).
  // Wait time reduces the score by 3 points per minute waited.
  return (player.gamesPlayed * 100) - (waitMinutes * 3);
}

/**
 * Selects and balances players for an open court based on the Fair Rotation algorithm.
 */
export function autoMatchmake(
  availablePlayers: Player[],
  matchType: MatchType = 'doubles'
): MatchmakingResult | null {
  const needed = matchType === 'doubles' ? 4 : 2;
  const readyPlayers = availablePlayers.filter((p) => p.status === 'ready');

  if (readyPlayers.length < needed) {
    return null;
  }

  const now = Date.now();

  // Sort players by priority (lowest score = highest priority to play)
  const prioritized = [...readyPlayers].sort((a, b) => {
    const scoreA = calculatePlayerPriority(a, now);
    const scoreB = calculatePlayerPriority(b, now);
    if (scoreA !== scoreB) return scoreA - scoreB;
    // Tie breaker: fewer total games
    if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed;
    // Tie breaker: earliest restStartedAt
    return a.restStartedAt - b.restStartedAt;
  });

  const selectedPlayers = prioritized.slice(0, needed);

  if (matchType === 'singles') {
    return {
      teamA: [selectedPlayers[0]],
      teamB: [selectedPlayers[1]],
      reason: `จัดคิวเดี่ยว: ${selectedPlayers[0].name} (เล่นไป ${selectedPlayers[0].gamesPlayed} เกม) พบกับ ${selectedPlayers[1].name} (เล่นไป ${selectedPlayers[1].gamesPlayed} เกม)`,
    };
  }

  // Doubles balancing: 4 players
  // Sort selected 4 by skill rating
  const sortedBySkill = [...selectedPlayers].sort(
    (a, b) => SKILL_WEIGHT[a.skillLevel] - SKILL_WEIGHT[b.skillLevel]
  );

  // Strategy: Pair Lowest with Highest (0 + 3) vs Middle two (1 + 2)
  // This produces the closest total skill balance:
  const teamA = [sortedBySkill[0], sortedBySkill[3]];
  const teamB = [sortedBySkill[1], sortedBySkill[2]];

  const skillA = SKILL_WEIGHT[teamA[0].skillLevel] + SKILL_WEIGHT[teamA[1].skillLevel];
  const skillB = SKILL_WEIGHT[teamB[0].skillLevel] + SKILL_WEIGHT[teamB[1].skillLevel];

  const avgGames = (selectedPlayers.reduce((acc, p) => acc + p.gamesPlayed, 0) / 4).toFixed(1);

  return {
    teamA,
    teamB,
    reason: `จัดคู่สมดุลฝีมือ (แต้มทีม ${skillA} vs ${skillB}) · เฉลี่ยเล่นแล้วคนละ ${avgGames} เกม`,
  };
}
