/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type PlayerStatus = 'ready' | 'playing' | 'resting';
export type Gender = 'male' | 'female' | 'unspecified';
export type MatchType = 'doubles' | 'singles';

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  skillLevel: SkillLevel;
  status: PlayerStatus;
  gender?: Gender;
  avatarColor: string;
  gamesPlayed: number;
  gamesWon: number;
  restStartedAt: number; // timestamp
  currentCourtId?: string;
  hasPaid?: boolean;
}

export interface SetScore {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  winner?: 'teamA' | 'teamB';
}

export interface Court {
  id: string;
  number: number;
  name: string;
  isOccupied: boolean;
  matchType: MatchType;
  teamA: Player[];
  teamB: Player[];
  scoreA: number;
  scoreB: number;
  setsWonA: number;
  setsWonB: number;
  currentSet: number;
  sets: SetScore[];
  servingSide: 'teamA' | 'teamB';
  // Position markers for BWF doubles
  serverPlayerId?: string;
  receiverPlayerId?: string;
  matchStartedAt?: number;
  isPaused?: boolean;
  pausedSeconds?: number;
}

export interface MatchHistoryItem {
  id: string;
  courtName: string;
  matchType: MatchType;
  teamANames: string[];
  teamBNames: string[];
  scoreA: number;
  scoreB: number;
  sets: { scoreA: number; scoreB: number }[];
  winner: 'teamA' | 'teamB';
  durationSeconds: number;
  finishedAt: number;
}

export interface ExpenseSettings {
  courtHourlyRate: number;
  totalCourtHours: number;
  shuttlePricePerUnit: number;
  shuttlesUsed: number;
  shuttleBrand: string;
  additionalFee: number;
  additionalFeeDescription: string;
  splitMethod: 'equal' | 'per_game';
  promptPayId: string;
  promptPayName: string;
}

export interface SessionInfo {
  sessionName: string;
  venueName: string;
  date: string;
  maxPoints: number; // standard 21, or 15 / 30
  maxSets: number; // standard 1 (single game) or 3 (best of 3)
  deuceLimit: number; // standard 30
  inviteCode: string;
  isJoinOpen: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  nickname: string;
  email: string;
  provider: 'gmail' | 'password';
  avatarUrl?: string;
  avatarColor: string;
  skillLevel: SkillLevel;
  role: 'organizer' | 'member';
  registeredAt: number;
  lastLoginAt: number;
  rememberMe: boolean;
  linkedPlayerId?: string;
}

