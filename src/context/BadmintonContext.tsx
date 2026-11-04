/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Player,
  Court,
  MatchHistoryItem,
  ExpenseSettings,
  SessionInfo,
  MatchType,
  SetScore,
  UserAccount,
  SkillLevel,
  Gender,
} from '../types/badminton';
import { autoMatchmake } from '../utils/matchmaker';
import { sounds } from '../utils/audio';

const STORAGE_KEY_PLAYERS = 'badmintonhub_players_v1';
const STORAGE_KEY_COURTS = 'badmintonhub_courts_v1';
const STORAGE_KEY_HISTORY = 'badmintonhub_history_v1';
const STORAGE_KEY_EXPENSES = 'badmintonhub_expenses_v1';
const STORAGE_KEY_SESSION = 'badmintonhub_session_v1';
const STORAGE_KEY_THEME = 'badmintonhub_theme_v1';
const STORAGE_KEY_VOICE_LANG = 'badmintonhub_voice_lang_v1';
const STORAGE_KEY_VOICE_ENABLED = 'badmintonhub_voice_enabled_v1';
const STORAGE_KEY_USERS = 'badmintonhub_users_v1';
const STORAGE_KEY_AUTH_USER = 'badmintonhub_auth_user_v1';

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-able',
    name: 'Able Badminton',
    nickname: 'Able',
    email: 'able1272549@gmail.com',
    provider: 'gmail',
    avatarColor: '#10b981',
    skillLevel: 'intermediate',
    role: 'organizer',
    registeredAt: Date.now() - 7 * 86400000,
    lastLoginAt: Date.now(),
    rememberMe: true,
    linkedPlayerId: 'p1',
  },
];

const DEFAULT_PLAYERS: Player[] = [
  { id: 'p1', name: 'ต้น (Ton)', nickname: 'ต้น', skillLevel: 'advanced', status: 'ready', gender: 'male', avatarColor: '#10b981', gamesPlayed: 2, gamesWon: 2, restStartedAt: Date.now() - 15 * 60000, hasPaid: false },
  { id: 'p2', name: 'บอล (Ball)', nickname: 'บอล', skillLevel: 'intermediate', status: 'ready', gender: 'male', avatarColor: '#3b82f6', gamesPlayed: 2, gamesWon: 1, restStartedAt: Date.now() - 10 * 60000, hasPaid: true },
  { id: 'p3', name: 'มุก (Mook)', nickname: 'มุก', skillLevel: 'beginner', status: 'ready', gender: 'female', avatarColor: '#ec4899', gamesPlayed: 1, gamesWon: 0, restStartedAt: Date.now() - 25 * 60000, hasPaid: false },
  { id: 'p4', name: 'กอล์ฟ (Golf)', nickname: 'กอล์ฟ', skillLevel: 'intermediate', status: 'ready', gender: 'male', avatarColor: '#f59e0b', gamesPlayed: 2, gamesWon: 1, restStartedAt: Date.now() - 8 * 60000, hasPaid: false },
  { id: 'p5', name: 'แนน (Nan)', nickname: 'แนน', skillLevel: 'intermediate', status: 'ready', gender: 'female', avatarColor: '#8b5cf6', gamesPlayed: 1, gamesWon: 1, restStartedAt: Date.now() - 18 * 60000, hasPaid: true },
  { id: 'p6', name: 'อาร์ม (Arm)', nickname: 'อาร์ม', skillLevel: 'advanced', status: 'ready', gender: 'male', avatarColor: '#06b6d4', gamesPlayed: 3, gamesWon: 2, restStartedAt: Date.now() - 5 * 60000, hasPaid: false },
  { id: 'p7', name: 'พีช (Peach)', nickname: 'พีช', skillLevel: 'beginner', status: 'ready', gender: 'female', avatarColor: '#f43f5e', gamesPlayed: 1, gamesWon: 0, restStartedAt: Date.now() - 30 * 60000, hasPaid: false },
  { id: 'p8', name: 'เจมส์ (James)', nickname: 'เจมส์', skillLevel: 'intermediate', status: 'ready', gender: 'male', avatarColor: '#14b8a6', gamesPlayed: 2, gamesWon: 1, restStartedAt: Date.now() - 12 * 60000, hasPaid: true },
];

const DEFAULT_COURTS: Court[] = [
  {
    id: 'court-1',
    number: 1,
    name: 'คอร์ท 1 (Court 1)',
    isOccupied: false,
    matchType: 'doubles',
    teamA: [],
    teamB: [],
    scoreA: 0,
    scoreB: 0,
    setsWonA: 0,
    setsWonB: 0,
    currentSet: 1,
    sets: [],
    servingSide: 'teamA',
  },
  {
    id: 'court-2',
    number: 2,
    name: 'คอร์ท 2 (Court 2)',
    isOccupied: false,
    matchType: 'doubles',
    teamA: [],
    teamB: [],
    scoreA: 0,
    scoreB: 0,
    setsWonA: 0,
    setsWonB: 0,
    currentSet: 1,
    sets: [],
    servingSide: 'teamB',
  },
];

const DEFAULT_EXPENSES: ExpenseSettings = {
  courtHourlyRate: 200,
  totalCourtHours: 2,
  shuttlePricePerUnit: 85,
  shuttlesUsed: 4,
  shuttleBrand: 'RSL Silver Speed 76',
  additionalFee: 0,
  additionalFeeDescription: '',
  splitMethod: 'equal',
  promptPayId: '0812345678',
  promptPayName: 'สมชาย รักแบด (กัปตันก๊วน)',
};

const DEFAULT_SESSION: SessionInfo = {
  sessionName: 'ก๊วนแบดมินตันวันศุกร์หรรษา',
  venueName: 'สนามแบดมินตัน วิคตอรี่ เซ็นเตอร์',
  date: new Date().toISOString().split('T')[0],
  maxPoints: 21,
  maxSets: 1,
  deuceLimit: 30,
  inviteCode: 'BADM-8899',
  isJoinOpen: true,
};

interface BadmintonContextType {
  courts: Court[];
  players: Player[];
  matchHistory: MatchHistoryItem[];
  expenses: ExpenseSettings;
  sessionInfo: SessionInfo;
  activeCourtIdForScoreboard: string | null;
  soundMuted: boolean;
  theme: 'dark' | 'light';
  addCourt: (name?: string) => void;
  removeCourt: (courtId: string) => void;
  addPlayer: (playerData: Omit<Player, 'id' | 'gamesPlayed' | 'gamesWon' | 'restStartedAt'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  togglePlayerStatus: (id: string) => void;
  togglePlayerPayment: (id: string) => void;
  loadSampleSquad: () => void;
  resetSession: () => void;
  startMatchOnCourt: (courtId: string, teamA: Player[], teamB: Player[], matchType: MatchType) => void;
  autoMatchCourt: (courtId: string, matchType?: MatchType) => { success: boolean; message: string };
  updateCourtScore: (courtId: string, team: 'teamA' | 'teamB', delta: number) => void;
  switchCourtServingSide: (courtId: string) => void;
  swapCourtSides: (courtId: string) => void;
  finishCourtMatch: (courtId: string) => void;
  cancelCourtMatch: (courtId: string) => void;
  updateExpenses: (updates: Partial<ExpenseSettings>) => void;
  updateSessionInfo: (updates: Partial<SessionInfo>) => void;
  toggleSound: () => void;
  toggleTheme: () => void;
  voiceLanguage: 'th' | 'en';
  voiceEnabled: boolean;
  setVoiceLanguage: (lang: 'th' | 'en') => void;
  toggleVoiceLanguage: () => void;
  toggleVoiceEnabled: () => void;
  setActiveCourtIdForScoreboard: (id: string | null) => void;
  currentUser: UserAccount | null;
  registeredUsers: UserAccount[];
  loginWithGmail: (email?: string, name?: string) => Promise<boolean>;
  loginWithPassword: (email: string, password?: string, rememberMe?: boolean) => { success: boolean; message?: string };
  registerUser: (data: { name: string; nickname?: string; email: string; password?: string; skillLevel: SkillLevel; rememberMe: boolean }) => boolean;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserAccount>) => void;
  joinSessionAsPlayer: (playerData: {
    name: string;
    nickname?: string;
    skillLevel: SkillLevel;
    gender?: Gender;
    preferredCourtId?: string;
    preferredTeam?: 'teamA' | 'teamB';
  }) => { success: boolean; message: string; player: Player };
  joinCourtSlot: (courtId: string, playerId: string, team: 'teamA' | 'teamB') => { success: boolean; message: string };
  leaveCourtSlot: (courtId: string, playerId: string) => void;
  regenerateInviteCode: () => string;
}

const BadmintonContext = createContext<BadmintonContextType | undefined>(undefined);

export const BadmintonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
      return saved ? JSON.parse(saved) : DEFAULT_PLAYERS;
    } catch {
      return DEFAULT_PLAYERS;
    }
  });

  const [courts, setCourts] = useState<Court[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COURTS);
      return saved ? JSON.parse(saved) : DEFAULT_COURTS;
    } catch {
      return DEFAULT_COURTS;
    }
  });

  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState<ExpenseSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
    } catch {
      return DEFAULT_EXPENSES;
    }
  });

  const [sessionInfo, setSessionInfo] = useState<SessionInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SESSION,
          ...parsed,
          inviteCode: parsed?.inviteCode || DEFAULT_SESSION.inviteCode,
        };
      }
      return DEFAULT_SESSION;
    } catch {
      return DEFAULT_SESSION;
    }
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [activeCourtIdForScoreboard, setActiveCourtIdForScoreboard] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
    } catch {}
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COURTS, JSON.stringify(courts));
    } catch {}
  }, [courts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(matchHistory));
    } catch {}
  }, [matchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionInfo));
    } catch {}
  }, [sessionInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [theme]);

  const [voiceLanguage, setVoiceLanguageState] = useState<'th' | 'en'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOICE_LANG);
      return saved === 'en' ? 'en' : 'th';
    } catch {
      return 'th';
    }
  });

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOICE_ENABLED);
      return saved !== 'false'; // default true
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VOICE_LANG, voiceLanguage);
    } catch {}
  }, [voiceLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VOICE_ENABLED, String(voiceEnabled));
    } catch {}
  }, [voiceEnabled]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    setSoundMuted((prev) => {
      const next = !prev;
      sounds.setMuted(next);
      return next;
    });
  };

  const toggleVoiceLanguage = () => {
    setVoiceLanguageState((prev) => (prev === 'th' ? 'en' : 'th'));
  };

  const setVoiceLanguage = (lang: 'th' | 'en') => {
    setVoiceLanguageState(lang);
  };

  const toggleVoiceEnabled = () => {
    setVoiceEnabled((prev) => !prev);
  };

  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedLocal = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (savedLocal) return JSON.parse(savedLocal);
      const savedSession = sessionStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (savedSession) return JSON.parse(savedSession);
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(registeredUsers));
    } catch {}
  }, [registeredUsers]);

  useEffect(() => {
    try {
      if (currentUser) {
        if (currentUser.rememberMe) {
          localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(currentUser));
          sessionStorage.removeItem(STORAGE_KEY_AUTH_USER);
        } else {
          sessionStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(currentUser));
          localStorage.removeItem(STORAGE_KEY_AUTH_USER);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
        sessionStorage.removeItem(STORAGE_KEY_AUTH_USER);
      }
    } catch {}
  }, [currentUser]);

  const loginWithGmail = async (targetEmail?: string, displayName?: string): Promise<boolean> => {
    const email = targetEmail || 'able1272549@gmail.com';
    let user = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      user = {
        id: `u-${Date.now()}`,
        name: displayName || email.split('@')[0],
        nickname: displayName?.split(' ')[0] || email.split('@')[0],
        email,
        provider: 'gmail',
        avatarColor: '#10b981',
        skillLevel: 'intermediate',
        role: 'member',
        registeredAt: Date.now(),
        lastLoginAt: Date.now(),
        rememberMe: true,
      };

      setRegisteredUsers((prev) => [...prev, user!]);

      const playerExists = players.some((p) => p.name.toLowerCase() === user!.name.toLowerCase());
      if (!playerExists) {
        const newPlayer: Player = {
          id: `p-${Date.now()}`,
          name: user.name,
          nickname: user.nickname,
          skillLevel: user.skillLevel,
          status: 'ready',
          avatarColor: user.avatarColor,
          gamesPlayed: 0,
          gamesWon: 0,
          restStartedAt: Date.now(),
          hasPaid: false,
        };
        setPlayers((prev) => [...prev, newPlayer]);
        user.linkedPlayerId = newPlayer.id;
      }
    } else {
      user = { ...user, lastLoginAt: Date.now(), rememberMe: true };
      setRegisteredUsers((prev) => prev.map((u) => (u.id === user!.id ? user! : u)));
    }

    setCurrentUser(user);
    sounds.playWhistle();
    return true;
  };

  const loginWithPassword = (email: string, _password?: string, rememberMe: boolean = true) => {
    const user = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้งานที่มีอีเมลนี้ กรุณาลงทะเบียน' };
    }
    const updated = { ...user, lastLoginAt: Date.now(), rememberMe };
    setRegisteredUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    setCurrentUser(updated);
    sounds.playWhistle();
    return { success: true };
  };

  const registerUser = (data: {
    name: string;
    nickname?: string;
    email: string;
    password?: string;
    skillLevel: SkillLevel;
    rememberMe: boolean;
  }): boolean => {
    const exists = registeredUsers.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) return false;

    const colors = ['#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4', '#14b8a6', '#f43f5e'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      name: data.name,
      nickname: data.nickname || data.name.split(' ')[0],
      email: data.email,
      provider: data.email.toLowerCase().includes('@gmail.com') ? 'gmail' : 'password',
      avatarColor: randomColor,
      skillLevel: data.skillLevel,
      role: 'member',
      registeredAt: Date.now(),
      lastLoginAt: Date.now(),
      rememberMe: data.rememberMe,
    };

    setRegisteredUsers((prev) => [...prev, newUser]);

    const playerExists = players.some((p) => p.name.toLowerCase() === newUser.name.toLowerCase());
    if (!playerExists) {
      const newPlayer: Player = {
        id: `p-${Date.now()}`,
        name: newUser.name,
        nickname: newUser.nickname,
        skillLevel: newUser.skillLevel,
        status: 'ready',
        avatarColor: newUser.avatarColor,
        gamesPlayed: 0,
        gamesWon: 0,
        restStartedAt: Date.now(),
        hasPaid: false,
      };
      setPlayers((prev) => [...prev, newPlayer]);
      newUser.linkedPlayerId = newPlayer.id;
    }

    setCurrentUser(newUser);
    sounds.playWhistle();
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (updates: Partial<UserAccount>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setRegisteredUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const addCourt = (name?: string) => {
    setCourts((prev) => {
      const nextNum = prev.length > 0 ? Math.max(...prev.map((c) => c.number)) + 1 : 1;
      const newCourt: Court = {
        id: `court-${Date.now()}`,
        number: nextNum,
        name: name || `คอร์ท ${nextNum} (Court ${nextNum})`,
        isOccupied: false,
        matchType: 'doubles',
        teamA: [],
        teamB: [],
        scoreA: 0,
        scoreB: 0,
        setsWonA: 0,
        setsWonB: 0,
        currentSet: 1,
        sets: [],
        servingSide: 'teamA',
      };
      return [...prev, newCourt];
    });
  };

  const removeCourt = (courtId: string) => {
    // If court has players, return them to ready bench
    const courtToRemove = courts.find((c) => c.id === courtId);
    if (courtToRemove && courtToRemove.isOccupied) {
      const playerIds = [...courtToRemove.teamA, ...courtToRemove.teamB].map((p) => p.id);
      setPlayers((prev) =>
        prev.map((p) =>
          playerIds.includes(p.id)
            ? { ...p, status: 'ready', currentCourtId: undefined, restStartedAt: Date.now() }
            : p
        )
      );
    }
    setCourts((prev) => prev.filter((c) => c.id !== courtId));
    if (activeCourtIdForScoreboard === courtId) {
      setActiveCourtIdForScoreboard(null);
    }
  };

  const addPlayer = (playerData: Omit<Player, 'id' | 'gamesPlayed' | 'gamesWon' | 'restStartedAt'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: `p-${Date.now()}`,
      gamesPlayed: 0,
      gamesWon: 0,
      restStartedAt: Date.now(),
      hasPaid: false,
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    // Also sync in court if playing
    setCourts((prev) =>
      prev.map((court) => ({
        ...court,
        teamA: court.teamA.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        teamB: court.teamB.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }))
    );
  };

  const deletePlayer = (id: string) => {
    // Remove from court if currently playing
    setCourts((prev) =>
      prev.map((court) => ({
        ...court,
        teamA: court.teamA.filter((p) => p.id !== id),
        teamB: court.teamB.filter((p) => p.id !== id),
      }))
    );
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePlayerStatus = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.status === 'playing') return p; // Cannot toggle while playing
        const nextStatus = p.status === 'ready' ? 'resting' : 'ready';
        return {
          ...p,
          status: nextStatus,
          restStartedAt: nextStatus === 'ready' ? Date.now() : p.restStartedAt,
        };
      })
    );
  };

  const togglePlayerPayment = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hasPaid: !p.hasPaid } : p))
    );
  };

  const loadSampleSquad = () => {
    setPlayers(DEFAULT_PLAYERS);
    sounds.playWhistle();
  };

  const resetSession = () => {
    setCourts(DEFAULT_COURTS);
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        status: 'ready',
        gamesPlayed: 0,
        gamesWon: 0,
        restStartedAt: Date.now(),
        currentCourtId: undefined,
        hasPaid: false,
      }))
    );
    setMatchHistory([]);
    setActiveCourtIdForScoreboard(null);
  };

  const startMatchOnCourt = (
    courtId: string,
    teamA: Player[],
    teamB: Player[],
    matchType: MatchType
  ) => {
    const playerIds = [...teamA, ...teamB].map((p) => p.id);

    // Update player statuses to 'playing'
    setPlayers((prev) =>
      prev.map((p) =>
        playerIds.includes(p.id)
          ? { ...p, status: 'playing', currentCourtId: courtId }
          : p
      )
    );

    // Update court
    setCourts((prev) =>
      prev.map((court) => {
        if (court.id !== courtId) return court;
        return {
          ...court,
          isOccupied: true,
          matchType,
          teamA,
          teamB,
          scoreA: 0,
          scoreB: 0,
          setsWonA: 0,
          setsWonB: 0,
          currentSet: 1,
          sets: [],
          servingSide: 'teamA',
          serverPlayerId: teamA[0]?.id,
          receiverPlayerId: teamB[0]?.id,
          matchStartedAt: Date.now(),
          isPaused: false,
          pausedSeconds: 0,
        };
      })
    );

    sounds.playWhistle();
  };

  const autoMatchCourt = (courtId: string, matchType: MatchType = 'doubles') => {
    const court = courts.find((c) => c.id === courtId);
    if (!court) {
      return { success: false, message: 'ไม่พบคอร์ทที่เลือก' };
    }
    if (court.isOccupied) {
      return { success: false, message: 'คอร์ทนี้กำลังมีแมตช์แข่งขันอยู่' };
    }

    const availablePlayers = players.filter((p) => p.status === 'ready' && !p.currentCourtId);
    const result = autoMatchmake(availablePlayers, matchType);

    if (!result) {
      const needed = matchType === 'doubles' ? 4 : 2;
      return {
        success: false,
        message: `ผู้เล่นสถานะ "พร้อมเล่น" ไม่เพียงพอ (ต้องการ ${needed} คน แต่มีเพียง ${availablePlayers.length} คน)`,
      };
    }

    startMatchOnCourt(courtId, result.teamA, result.teamB, matchType);
    return { success: true, message: result.reason };
  };

  const updateCourtScore = (courtId: string, team: 'teamA' | 'teamB', delta: number) => {
    setCourts((prev) =>
      prev.map((court) => {
        if (court.id !== courtId || !court.isOccupied) return court;

        const maxPoints = sessionInfo.maxPoints;
        const deuceLimit = sessionInfo.deuceLimit;

        let nextScoreA = court.scoreA;
        let nextScoreB = court.scoreB;

        if (team === 'teamA') {
          nextScoreA = Math.max(0, nextScoreA + delta);
        } else {
          nextScoreB = Math.max(0, nextScoreB + delta);
        }

        // BWF Rules: Side out / Service change
        let nextServingSide = court.servingSide;
        if (delta > 0) {
          nextServingSide = team;
        }

        // Check if set is won
        const isTeamAWon =
          (nextScoreA >= maxPoints && nextScoreA - nextScoreB >= 2) ||
          nextScoreA >= deuceLimit;
        const isTeamBWon =
          (nextScoreB >= maxPoints && nextScoreB - nextScoreA >= 2) ||
          nextScoreB >= deuceLimit;

        if (delta > 0) {
          sounds.playPoint();
          if (voiceEnabled) {
            const isMatchPoint =
              (nextScoreA === maxPoints - 1 && nextScoreA > nextScoreB) ||
              (nextScoreB === maxPoints - 1 && nextScoreB > nextScoreA);
            const isDeucePoint =
              nextScoreA >= maxPoints - 1 &&
              nextScoreB >= maxPoints - 1 &&
              nextScoreA === nextScoreB;
            const event =
              isTeamAWon || isTeamBWon
                ? 'game_won'
                : isMatchPoint
                ? 'match_point'
                : isDeucePoint
                ? 'deuce'
                : 'point';
            sounds.announceScore(
              nextScoreA,
              nextScoreB,
              nextServingSide,
              voiceLanguage,
              event
            );
          }
        } else {
          sounds.playHit();
        }

        if (isTeamAWon || isTeamBWon) {
          const winner: 'teamA' | 'teamB' = isTeamAWon ? 'teamA' : 'teamB';
          sounds.playVictory();

          const finishedSet: SetScore = {
            setNumber: court.currentSet,
            scoreA: nextScoreA,
            scoreB: nextScoreB,
            winner,
          };

          const newSets: SetScore[] = [...court.sets, finishedSet];
          const newSetsWonA = court.setsWonA + (isTeamAWon ? 1 : 0);
          const newSetsWonB = court.setsWonB + (isTeamBWon ? 1 : 0);

          const neededSets = Math.ceil(sessionInfo.maxSets / 2);

          // If match over
          if (newSetsWonA >= neededSets || newSetsWonB >= neededSets) {
            // Match is ready to finish
            return {
              ...court,
              scoreA: nextScoreA,
              scoreB: nextScoreB,
              setsWonA: newSetsWonA,
              setsWonB: newSetsWonB,
              sets: newSets,
              servingSide: nextServingSide,
            };
          } else {
            // Next set
            return {
              ...court,
              scoreA: 0,
              scoreB: 0,
              setsWonA: newSetsWonA,
              setsWonB: newSetsWonB,
              currentSet: court.currentSet + 1,
              sets: newSets,
              servingSide: winner,
            };
          }
        }

        // Check for Game Point / Match Point alert
        if (
          (nextScoreA === maxPoints - 1 && nextScoreB < maxPoints - 1) ||
          (nextScoreB === maxPoints - 1 && nextScoreA < maxPoints - 1)
        ) {
          sounds.playAlert();
        }

        return {
          ...court,
          scoreA: nextScoreA,
          scoreB: nextScoreB,
          servingSide: nextServingSide,
        };
      })
    );
  };

  const switchCourtServingSide = (courtId: string) => {
    setCourts((prev) =>
      prev.map((c) =>
        c.id === courtId
          ? { ...c, servingSide: c.servingSide === 'teamA' ? 'teamB' : 'teamA' }
          : c
      )
    );
    sounds.playHit();
  };

  const swapCourtSides = (courtId: string) => {
    setCourts((prev) =>
      prev.map((c) => {
        if (c.id !== courtId) return c;
        return {
          ...c,
          teamA: c.teamB,
          teamB: c.teamA,
          scoreA: c.scoreB,
          scoreB: c.scoreA,
          setsWonA: c.setsWonB,
          setsWonB: c.setsWonA,
          servingSide: c.servingSide === 'teamA' ? 'teamB' : 'teamA',
        };
      })
    );
    sounds.playHit();
  };

  const finishCourtMatch = (courtId: string) => {
    const court = courts.find((c) => c.id === courtId);
    if (!court || !court.isOccupied) return;

    const winner: 'teamA' | 'teamB' =
      court.setsWonA > court.setsWonB
        ? 'teamA'
        : court.setsWonB > court.setsWonA
        ? 'teamB'
        : court.scoreA >= court.scoreB
        ? 'teamA'
        : 'teamB';

    const durationSeconds = court.matchStartedAt
      ? Math.floor((Date.now() - court.matchStartedAt) / 1000)
      : 0;

    const winningTeam = winner === 'teamA' ? court.teamA : court.teamB;
    const winningIds = winningTeam.map((p) => p.id);
    const allPlayingIds = [...court.teamA, ...court.teamB].map((p) => p.id);

    // Save match to history
    const historyItem: MatchHistoryItem = {
      id: `match-${Date.now()}`,
      courtName: court.name,
      matchType: court.matchType,
      teamANames: court.teamA.map((p) => p.nickname || p.name),
      teamBNames: court.teamB.map((p) => p.nickname || p.name),
      scoreA: court.scoreA,
      scoreB: court.scoreB,
      sets: court.sets.length > 0 ? court.sets.map((s) => ({ scoreA: s.scoreA, scoreB: s.scoreB })) : [{ scoreA: court.scoreA, scoreB: court.scoreB }],
      winner,
      durationSeconds,
      finishedAt: Date.now(),
    };

    setMatchHistory((prev) => [historyItem, ...prev]);

    // Update players: increment gamesPlayed, gamesWon for winners, reset status to 'ready'
    const now = Date.now();
    setPlayers((prev) =>
      prev.map((p) => {
        if (!allPlayingIds.includes(p.id)) return p;
        const isWinner = winningIds.includes(p.id);
        return {
          ...p,
          status: 'ready',
          currentCourtId: undefined,
          gamesPlayed: p.gamesPlayed + 1,
          gamesWon: p.gamesWon + (isWinner ? 1 : 0),
          restStartedAt: now,
        };
      })
    );

    // Reset court
    setCourts((prev) =>
      prev.map((c) => {
        if (c.id !== courtId) return c;
        return {
          ...c,
          isOccupied: false,
          teamA: [],
          teamB: [],
          scoreA: 0,
          scoreB: 0,
          setsWonA: 0,
          setsWonB: 0,
          currentSet: 1,
          sets: [],
          matchStartedAt: undefined,
          isPaused: false,
        };
      })
    );

    sounds.playVictory();
  };

  const cancelCourtMatch = (courtId: string) => {
    const court = courts.find((c) => c.id === courtId);
    if (!court || !court.isOccupied) return;

    const allPlayingIds = [...court.teamA, ...court.teamB].map((p) => p.id);

    setPlayers((prev) =>
      prev.map((p) =>
        allPlayingIds.includes(p.id)
          ? { ...p, status: 'ready', currentCourtId: undefined }
          : p
      )
    );

    setCourts((prev) =>
      prev.map((c) => {
        if (c.id !== courtId) return c;
        return {
          ...c,
          isOccupied: false,
          teamA: [],
          teamB: [],
          scoreA: 0,
          scoreB: 0,
          setsWonA: 0,
          setsWonB: 0,
          currentSet: 1,
          sets: [],
          matchStartedAt: undefined,
        };
      })
    );
  };

  const updateExpenses = (updates: Partial<ExpenseSettings>) => {
    setExpenses((prev) => ({ ...prev, ...updates }));
  };

  const updateSessionInfo = (updates: Partial<SessionInfo>) => {
    setSessionInfo((prev) => ({ ...prev, ...updates }));
  };

  const regenerateInviteCode = (): string => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `BADM-${randomNum}`;
    setSessionInfo((prev) => {
      const updated = { ...prev, inviteCode: newCode };
      try {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    return newCode;
  };

  const joinSessionAsPlayer = (playerData: {
    name: string;
    nickname?: string;
    skillLevel: SkillLevel;
    gender?: Gender;
    preferredCourtId?: string;
    preferredTeam?: 'teamA' | 'teamB';
  }): { success: boolean; message: string; player: Player } => {
    const colors = [
      '#10b981',
      '#3b82f6',
      '#ec4899',
      '#f59e0b',
      '#8b5cf6',
      '#06b6d4',
      '#14b8a6',
      '#f43f5e',
      '#6366f1',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: playerData.name.trim(),
      nickname: playerData.nickname?.trim() || playerData.name.trim().split(' ')[0],
      skillLevel: playerData.skillLevel,
      status: 'ready',
      gender: playerData.gender || 'unspecified',
      avatarColor: randomColor,
      gamesPlayed: 0,
      gamesWon: 0,
      restStartedAt: Date.now(),
      hasPaid: false,
    };

    let assignedCourtName = '';
    let assignedTeamName = '';

    if (playerData.preferredCourtId) {
      const targetCourt = courts.find((c) => c.id === playerData.preferredCourtId);
      if (targetCourt) {
        const maxPerTeam = targetCourt.matchType === 'singles' ? 1 : 2;
        let chosenTeam: 'teamA' | 'teamB' | null = playerData.preferredTeam || null;
        if (!chosenTeam) {
          if (targetCourt.teamA.length < maxPerTeam) chosenTeam = 'teamA';
          else if (targetCourt.teamB.length < maxPerTeam) chosenTeam = 'teamB';
        }

        if (chosenTeam) {
          const teamList = chosenTeam === 'teamA' ? targetCourt.teamA : targetCourt.teamB;
          if (teamList.length < maxPerTeam) {
            newPlayer.status = 'playing';
            newPlayer.currentCourtId = targetCourt.id;
            assignedCourtName = targetCourt.name;
            assignedTeamName = chosenTeam === 'teamA' ? 'ทีม A' : 'ทีม B';

            const newTeamA = chosenTeam === 'teamA' ? [...targetCourt.teamA, newPlayer] : targetCourt.teamA;
            const newTeamB = chosenTeam === 'teamB' ? [...targetCourt.teamB, newPlayer] : targetCourt.teamB;
            const totalRequired = targetCourt.matchType === 'singles' ? 2 : 4;
            const isFullNow = newTeamA.length + newTeamB.length === totalRequired;

            setCourts((prev) =>
              prev.map((c) =>
                c.id === targetCourt.id
                  ? {
                      ...c,
                      teamA: newTeamA,
                      teamB: newTeamB,
                      isOccupied: isFullNow,
                      matchStartedAt: isFullNow ? Date.now() : undefined,
                    }
                  : c
              )
            );
          }
        }
      }
    }

    setPlayers((prev) => [...prev, newPlayer]);

    if (currentUser && !currentUser.linkedPlayerId) {
      updateUserProfile({ linkedPlayerId: newPlayer.id });
    }

    sounds.playVictory();

    const message = assignedCourtName
      ? `คุณ ${newPlayer.nickname} เข้าสู่ ${assignedCourtName} (${assignedTeamName}) สำเร็จ!`
      : `ยินดีต้อนรับคุณ ${newPlayer.nickname} เข้าสู่ก๊วน! ได้รับการจัดเข้าคิวรอเล่นเรียบร้อย`;

    return {
      success: true,
      message,
      player: newPlayer,
    };
  };

  const joinCourtSlot = (
    courtId: string,
    playerId: string,
    team: 'teamA' | 'teamB'
  ): { success: boolean; message: string } => {
    const court = courts.find((c) => c.id === courtId);
    const player = players.find((p) => p.id === playerId);
    if (!court || !player) {
      return { success: false, message: 'ไม่พบคอร์ทหรือข้อมูลผู้เล่น' };
    }

    const maxPerTeam = court.matchType === 'singles' ? 1 : 2;
    const currentTeamList = team === 'teamA' ? court.teamA : court.teamB;
    const otherTeamList = team === 'teamA' ? court.teamB : court.teamA;

    if (currentTeamList.some((p) => p.id === playerId)) {
      return { success: false, message: 'ผู้เล่นอยู่ในทีมนี้อยู่แล้ว' };
    }

    if (currentTeamList.length >= maxPerTeam) {
      return { success: false, message: `ทีม ${team === 'teamA' ? 'A' : 'B'} มีผู้เล่นเต็มแล้ว` };
    }

    // Remove from other team if currently on it
    const filteredOtherTeam = otherTeamList.filter((p) => p.id !== playerId);
    const updatedTeamList = [...currentTeamList, player];

    const newTeamA = team === 'teamA' ? updatedTeamList : filteredOtherTeam;
    const newTeamB = team === 'teamB' ? updatedTeamList : filteredOtherTeam;

    const totalNeeded = court.matchType === 'singles' ? 2 : 4;
    const totalNow = newTeamA.length + newTeamB.length;
    const willBeOccupied = totalNow === totalNeeded;

    setCourts((prev) =>
      prev.map((c) => {
        if (c.id !== courtId) return c;
        return {
          ...c,
          teamA: newTeamA,
          teamB: newTeamB,
          isOccupied: willBeOccupied,
          matchStartedAt: willBeOccupied ? (c.matchStartedAt || Date.now()) : undefined,
          scoreA: willBeOccupied ? c.scoreA : 0,
          scoreB: willBeOccupied ? c.scoreB : 0,
        };
      })
    );

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            status: willBeOccupied ? 'playing' : 'ready',
            currentCourtId: courtId,
          };
        }
        return p;
      })
    );

    sounds.playClick();
    return {
      success: true,
      message: willBeOccupied
        ? `ผู้เล่นครบแล้ว! เริ่มการแข่งขันใน ${court.name}`
        : `เข้าร่วมทีม ${team === 'teamA' ? 'A' : 'B'} ใน ${court.name} สำเร็จ (ต้องการอีก ${totalNeeded - totalNow} คน)`,
    };
  };

  const leaveCourtSlot = (courtId: string, playerId: string) => {
    setCourts((prev) =>
      prev.map((c) => {
        if (c.id !== courtId) return c;
        const newTeamA = c.teamA.filter((p) => p.id !== playerId);
        const newTeamB = c.teamB.filter((p) => p.id !== playerId);
        const totalNeeded = c.matchType === 'singles' ? 2 : 4;
        const isStillFull = (newTeamA.length + newTeamB.length) === totalNeeded;
        return {
          ...c,
          teamA: newTeamA,
          teamB: newTeamB,
          isOccupied: isStillFull,
          matchStartedAt: isStillFull ? c.matchStartedAt : undefined,
        };
      })
    );

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          return { ...p, status: 'ready', currentCourtId: undefined };
        }
        return p;
      })
    );
  };

  return (
    <BadmintonContext.Provider
      value={{
        courts,
        players,
        matchHistory,
        expenses,
        sessionInfo,
        activeCourtIdForScoreboard,
        soundMuted,
        theme,
        addCourt,
        removeCourt,
        addPlayer,
        updatePlayer,
        deletePlayer,
        togglePlayerStatus,
        togglePlayerPayment,
        loadSampleSquad,
        resetSession,
        startMatchOnCourt,
        autoMatchCourt,
        updateCourtScore,
        switchCourtServingSide,
        swapCourtSides,
        finishCourtMatch,
        cancelCourtMatch,
        updateExpenses,
        updateSessionInfo,
        toggleSound,
        toggleTheme,
        voiceLanguage,
        voiceEnabled,
        setVoiceLanguage,
        toggleVoiceLanguage,
        toggleVoiceEnabled,
        setActiveCourtIdForScoreboard,
        currentUser,
        registeredUsers,
        loginWithGmail,
        loginWithPassword,
        registerUser,
        logout,
        updateUserProfile,
        joinSessionAsPlayer,
        joinCourtSlot,
        leaveCourtSlot,
        regenerateInviteCode,
      }}
    >
      {children}
    </BadmintonContext.Provider>
  );
};

export const useBadminton = (): BadmintonContextType => {
  const context = useContext(BadmintonContext);
  if (!context) {
    throw new Error('useBadminton must be used within a BadmintonProvider');
  }
  return context;
};
