/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  Maximize2,
  Volume2,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoveHorizontal,
  Plus,
  Minus,
  Mic,
  VolumeX,
  Languages,
} from 'lucide-react';
import { useBadminton } from '../context/BadmintonContext';
import { Court, Player } from '../types/badminton';
import { sounds } from '../utils/audio';

export const ScoreboardView: React.FC = () => {
  const {
    courts,
    sessionInfo,
    activeCourtIdForScoreboard,
    setActiveCourtIdForScoreboard,
    updateCourtScore,
    swapCourtSides,
    switchCourtServingSide,
    finishCourtMatch,
    voiceLanguage,
    voiceEnabled,
    setVoiceLanguage,
    toggleVoiceLanguage,
    toggleVoiceEnabled,
  } = useBadminton();

  // Find selected court or default to first occupied, or first available
  const selectedCourt =
    courts.find((c) => c.id === activeCourtIdForScoreboard) ||
    courts.find((c) => c.isOccupied) ||
    courts[0];

  const court = selectedCourt;

  // Standalone mode state if no court or empty court
  const [standaloneTeamAName, setStandaloneTeamAName] = useState('ทีม A');
  const [standaloneTeamBName, setStandaloneTeamBName] = useState('ทีม B');
  const [standaloneScoreA, setStandaloneScoreA] = useState(0);
  const [standaloneScoreB, setStandaloneScoreB] = useState(0);
  const [standaloneServing, setStandaloneServing] = useState<'A' | 'B'>('A');

  const maxPoints = sessionInfo.maxPoints;
  const deuceLimit = sessionInfo.deuceLimit;

  const scoreA = court?.isOccupied ? court.scoreA : standaloneScoreA;
  const scoreB = court?.isOccupied ? court.scoreB : standaloneScoreB;
  const servingSide = court?.isOccupied ? (court.servingSide === 'teamA' ? 'A' : 'B') : standaloneServing;

  // Check Game Point / Match Point / Deuce / Winner
  const isDeuce = scoreA >= maxPoints - 1 && scoreB >= maxPoints - 1 && scoreA === scoreB;
  const isMatchPointA =
    (scoreA >= maxPoints - 1 && scoreA > scoreB) ||
    (scoreA === deuceLimit - 1 && scoreB === deuceLimit - 1);
  const isMatchPointB =
    (scoreB >= maxPoints - 1 && scoreB > scoreA) ||
    (scoreA === deuceLimit - 1 && scoreB === deuceLimit - 1);

  const isWonA =
    (scoreA >= maxPoints && scoreA - scoreB >= 2) || (scoreA >= deuceLimit && scoreA > scoreB);
  const isWonB =
    (scoreB >= maxPoints && scoreB - scoreA >= 2) || (scoreB >= deuceLimit && scoreB > scoreA);

  const isGameOver = isWonA || isWonB;

  // Trigger celebration on game over
  useEffect(() => {
    if (isGameOver) {
      sounds.playVictory();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: isWonA ? ['#10b981', '#34d399', '#6ee7b7', '#a3e635'] : ['#3b82f6', '#60a5fa', '#93c5fd', '#38bdf8'],
      });
    }
  }, [isGameOver, isWonA]);

  const handleScoreChange = useCallback(
    (team: 'A' | 'B', delta: number) => {
      if (isGameOver && delta > 0) return;

      if (court && court.isOccupied) {
        updateCourtScore(court.id, team === 'A' ? 'teamA' : 'teamB', delta);
      } else {
        let nextA = standaloneScoreA;
        let nextB = standaloneScoreB;
        let nextServing = standaloneServing;

        if (team === 'A') {
          nextA = Math.max(0, standaloneScoreA + delta);
          setStandaloneScoreA(nextA);
          if (delta > 0) {
            nextServing = 'A';
            setStandaloneServing('A');
            sounds.playPoint();
          } else {
            sounds.playHit();
          }
        } else {
          nextB = Math.max(0, standaloneScoreB + delta);
          setStandaloneScoreB(nextB);
          if (delta > 0) {
            nextServing = 'B';
            setStandaloneServing('B');
            sounds.playPoint();
          } else {
            sounds.playHit();
          }
        }

        if (delta > 0 && voiceEnabled) {
          const isMatchPoint =
            (nextA === maxPoints - 1 && nextA > nextB) ||
            (nextB === maxPoints - 1 && nextB > nextA);
          const isDeucePoint =
            nextA >= maxPoints - 1 && nextB >= maxPoints - 1 && nextA === nextB;
          const isWon =
            (nextA >= maxPoints && nextA - nextB >= 2) ||
            (nextB >= maxPoints && nextB - nextA >= 2) ||
            nextA >= deuceLimit ||
            nextB >= deuceLimit;
          const event = isWon
            ? 'game_won'
            : isMatchPoint
            ? 'match_point'
            : isDeucePoint
            ? 'deuce'
            : 'point';
          sounds.announceScore(nextA, nextB, nextServing, voiceLanguage, event);
        }
      }
    },
    [court, isGameOver, standaloneScoreA, standaloneScoreB, standaloneServing, updateCourtScore, voiceEnabled, voiceLanguage, maxPoints, deuceLimit]
  );

  const handleTestVoice = () => {
    const isMatchPoint =
      (scoreA === maxPoints - 1 && scoreA > scoreB) ||
      (scoreB === maxPoints - 1 && scoreB > scoreA);
    const event = isGameOver
      ? 'game_won'
      : isDeuce
      ? 'deuce'
      : isMatchPoint
      ? 'match_point'
      : 'point';
    sounds.announceScore(scoreA, scoreB, servingSide, voiceLanguage, event);
  };

  // Keyboard shortcuts (ArrowLeft / A for Team A, ArrowRight / B for Team B, U for undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleScoreChange('A', 1);
      } else if (e.key === 'ArrowRight' || e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleScoreChange('B', 1);
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        // Undo last server's point
        if (servingSide === 'A' && scoreA > 0) {
          handleScoreChange('A', -1);
        } else if (servingSide === 'B' && scoreB > 0) {
          handleScoreChange('B', -1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScoreChange, scoreA, scoreB, servingSide]);

  const handleResetStandalone = () => {
    setStandaloneScoreA(0);
    setStandaloneScoreB(0);
    setStandaloneServing('A');
  };

  // Service court calculation according to BWF rules:
  // Even score (0, 2, 4...) = Right court
  // Odd score (1, 3, 5...) = Left court
  const serverScore = servingSide === 'A' ? scoreA : scoreB;
  const isEvenServe = serverScore % 2 === 0;

  // Active court service positions:
  // Team A (Left Half):
  // Top-Left = Left Court (Odd)
  // Bottom-Left = Right Court (Even)
  // Team B (Right Half):
  // Top-Right = Right Court (Even)
  // Bottom-Right = Left Court (Odd)
  // Note: Diagonal pairs are (Bottom-Left <-> Top-Right) for Even, and (Top-Left <-> Bottom-Right) for Odd!

  const isServerA_Left = servingSide === 'A' && !isEvenServe; // Odd -> Top-Left
  const isServerA_Right = servingSide === 'A' && isEvenServe; // Even -> Bottom-Left

  const isReceiverB_Right = servingSide === 'A' && isEvenServe; // Receives into Top-Right (Even)
  const isReceiverB_Left = servingSide === 'A' && !isEvenServe; // Receives into Bottom-Right (Odd)

  const isServerB_Right = servingSide === 'B' && isEvenServe; // Even -> Top-Right
  const isServerB_Left = servingSide === 'B' && !isEvenServe; // Odd -> Bottom-Right

  const isReceiverA_Right = servingSide === 'B' && isEvenServe; // Receives into Bottom-Left (Even)
  const isReceiverA_Left = servingSide === 'B' && !isEvenServe; // Receives into Top-Left (Odd)

  // Team players names
  const teamAPlayers = court?.isOccupied
    ? court.teamA
    : [{ id: 'a1', name: standaloneTeamAName, nickname: standaloneTeamAName, avatarColor: '#10b981' }];
  const teamBPlayers = court?.isOccupied
    ? court.teamB
    : [{ id: 'b1', name: standaloneTeamBName, nickname: standaloneTeamBName, avatarColor: '#3b82f6' }];

  return (
    <div className="space-y-6">
      {/* Top Court Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            เลือกคอร์ท:
          </label>
          <div className="relative">
            <select
              value={court?.id || ''}
              onChange={(e) => setActiveCourtIdForScoreboard(e.target.value)}
              className="appearance-none bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
            >
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.isOccupied ? '(กำลังแข่ง)' : '(ว่าง)'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {court?.isOccupied && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>กำลังแข่งขันสด</span>
            </span>
          )}
        </div>

        {/* Global score rules metadata */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>แต้มชนะ {maxPoints} แต้ม</span>
          <span aria-hidden="true">·</span>
          <span>ดิวส์สูงสุด {deuceLimit} แต้ม</span>
          {court?.isOccupied && (
            <button
              onClick={() => swapCourtSides(court.id)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>สลับฝั่งคอร์ท</span>
            </button>
          )}
        </div>
      </div>

      {/* Voice Announcement Referee Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleVoiceEnabled}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              voiceEnabled
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={voiceEnabled ? 'คลิกเพื่อปิดเสียงขานแต้ม' : 'คลิกเพื่อเปิดเสียงขานแต้ม'}
          >
            {voiceEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>{voiceEnabled ? 'เสียงขานแต้ม: เปิด (ON)' : 'เสียงขานแต้ม: ปิด (OFF)'}</span>
          </button>

          {/* Language Selection: Thai / English */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setVoiceLanguage('th')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                voiceLanguage === 'th'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇹🇭 ภาษาไทย</span>
            </button>
            <button
              onClick={() => setVoiceLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                voiceLanguage === 'en'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇬🇧 English</span>
            </button>
          </div>
        </div>

        {/* Test voice button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestVoice}
            disabled={!voiceEnabled}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700/60 active:scale-95"
            title="กดเพื่อทดลองฟังเสียงขานคะแนนปัจจุบัน"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>🔊 ทดลองฟังเสียงขานแต้ม</span>
          </button>
        </div>
      </div>

      {/* Main Scoreboard & Centerpiece Court Container */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
        {/* Match Alert & Status Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              สถานะการแข่งขัน:
            </span>
            {isGameOver ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 animate-bounce">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isWonA
                    ? `${teamAPlayers.map((p) => p.name).join(' & ')} ชนะแมตช์นี้!`
                    : `${teamBPlayers.map((p) => p.name).join(' & ')} ชนะแมตช์นี้!`}
                </span>
              </span>
            ) : isDeuce ? (
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>DEUCE (ดิวส์) — ต้องนำ 2 แต้ม หรือแต้มแรกที่ถึง {deuceLimit}</span>
              </span>
            ) : isMatchPointA ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                🏸 MATCH POINT สำหรับทีม A
              </span>
            ) : isMatchPointB ? (
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold">
                🏸 MATCH POINT สำหรับทีม B
              </span>
            ) : (
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <span>ฝั่งเสิร์ฟ: {servingSide === 'A' ? 'ทีม A' : 'ทีม B'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">
                  {isEvenServe ? 'เสิร์ฟจากช่องขวา (แต้มคู่)' : 'เสิร์ฟจากช่องซ้าย (แต้มคี่)'}
                </span>
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
            <span>คีย์บอร์ด: [← / A] บวกทีม A</span>
            <span aria-hidden="true">·</span>
            <span>[→ / B] บวกทีม B</span>
            <span aria-hidden="true">·</span>
            <span>[U] แก้แต้ม</span>
          </div>
        </div>

        {/* Top Score Headers (Team A & Team B Scores) */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 items-center">
          {/* Team A Score Column Header */}
          <div
            className={`p-4 md:p-5 rounded-2xl border transition-all ${
              servingSide === 'A'
                ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                {servingSide === 'A' && <span className="animate-pulse">🏸</span>}
                <span>ทีม A (ฝั่งซ้าย)</span>
              </span>
              {servingSide === 'A' && (
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  เสิร์ฟ {isEvenServe ? 'ช่องขวา' : 'ช่องซ้าย'}
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="text-sm md:text-base font-bold text-white truncate max-w-[180px] md:max-w-[280px]">
                {court?.isOccupied ? (
                  court.teamA.map((p) => p.name).join(' & ')
                ) : (
                  <input
                    type="text"
                    value={standaloneTeamAName}
                    onChange={(e) => setStandaloneTeamAName(e.target.value)}
                    className="bg-transparent border-b border-slate-700 font-bold text-white focus:outline-none focus:border-emerald-500 w-full"
                  />
                )}
              </div>
              <div className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-mono tabular-nums tracking-tight">
                {scoreA}
              </div>
            </div>
          </div>

          {/* Team B Score Column Header */}
          <div
            className={`p-4 md:p-5 rounded-2xl border transition-all ${
              servingSide === 'B'
                ? 'bg-blue-950/20 border-blue-500/50 shadow-md shadow-blue-500/5'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                {servingSide === 'B' && <span className="animate-pulse">🏸</span>}
                <span>ทีม B (ฝั่งขวา)</span>
              </span>
              {servingSide === 'B' && (
                <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/30">
                  เสิร์ฟ {isEvenServe ? 'ช่องขวา' : 'ช่องซ้าย'}
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="text-sm md:text-base font-bold text-white truncate max-w-[180px] md:max-w-[280px]">
                {court?.isOccupied ? (
                  court.teamB.map((p) => p.name).join(' & ')
                ) : (
                  <input
                    type="text"
                    value={standaloneTeamBName}
                    onChange={(e) => setStandaloneTeamBName(e.target.value)}
                    className="bg-transparent border-b border-slate-700 font-bold text-white focus:outline-none focus:border-blue-500 w-full"
                  />
                )}
              </div>
              <div className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-mono tabular-nums tracking-tight">
                {scoreB}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CENTERPIECE ENLARGED COURT SIMULATION (Expanded & High Contrast) */}
        {/* ============================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <span>จำลองสนามแบดมินตัน BWF (แตะบนสนามเพื่อเพิ่มแต้มได้)</span>
            </span>
            <span className="text-emerald-400 font-medium hidden sm:inline">
              ลูกศร 🏸 ชี้แนวเสิร์ฟทะแยงข้ามตาข่าย
            </span>
          </div>

          {/* The Large Court Canvas: Height expanded to h-64 md:h-80 lg:h-96 */}
          <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-emerald-950/80 border-4 border-emerald-500/60 rounded-2xl shadow-inner overflow-hidden select-none flex">
            {/* Court Turf Pattern Subtle Grid */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Doubles Outer Sideline Lines (Top & Bottom margins) */}
            <div className="absolute top-2 left-2 right-2 border-b border-white/50 pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 border-t border-white/50 pointer-events-none" />

            {/* Singles Inset Sideline Lines (Inside doubles) */}
            <div className="absolute top-6 left-2 right-2 border-b border-white/25 pointer-events-none" />
            <div className="absolute bottom-6 left-2 right-2 border-t border-white/25 pointer-events-none" />

            {/* Center Net Post & Net Line with 3D Effect */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-slate-900 border-x border-white/80 z-20 flex flex-col items-center justify-between py-2 shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
              <div className="w-full flex-1 flex flex-col justify-around py-4 opacity-40">
                <div className="h-0.5 bg-white w-full" />
                <div className="h-0.5 bg-white w-full" />
                <div className="h-0.5 bg-white w-full" />
                <div className="h-0.5 bg-white w-full" />
                <div className="h-0.5 bg-white w-full" />
              </div>
              <span className="bg-emerald-400 text-slate-950 text-[9px] font-black px-0.5 py-1 rounded uppercase tracking-widest writing-vertical -rotate-90">
                NET
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
            </div>

            {/* -------------------------------------------------------- */}
            {/* TEAM A SIDE (LEFT HALF OF COURT - EXACTLY ALIGNED WITH COL 1) */}
            {/* -------------------------------------------------------- */}
            <div
              onClick={() => handleScoreChange('A', 1)}
              className="w-1/2 h-full border-r border-white/40 grid grid-rows-2 relative cursor-pointer group"
              title="แตะสนามฝั่งซ้ายเพื่อ +1 แต้มให้ทีม A"
            >
              {/* Short Service Line (near net) */}
              <div className="absolute top-2 bottom-2 right-12 border-l border-white/40 pointer-events-none" />
              {/* Back Doubles Long Service Line */}
              <div className="absolute top-2 bottom-2 left-10 border-r border-white/30 pointer-events-none" />

              {/* Top-Left Box: Team A Left Court (Odd Points) */}
              <div
                className={`p-3 md:p-4 flex flex-col justify-between border-b border-white/30 transition-all ${
                  isServerA_Left
                    ? 'bg-emerald-500/30 ring-2 ring-inset ring-emerald-400'
                    : isReceiverA_Left
                    ? 'bg-blue-500/25 ring-2 ring-inset ring-blue-400'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-700/60">
                    ช่องซ้าย (แต้มคี่)
                  </span>
                  {isServerA_Left && (
                    <span className="text-xs font-black text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-full border border-emerald-400 flex items-center gap-1 shadow-lg animate-pulse">
                      <span>🏸</span>
                      <span>กำลังเสิร์ฟ ({scoreA})</span>
                    </span>
                  )}
                  {isReceiverA_Left && (
                    <span className="text-xs font-black text-blue-300 bg-blue-950/90 px-2.5 py-1 rounded-full border border-blue-400 flex items-center gap-1 shadow-lg animate-pulse">
                      <span>🎯</span>
                      <span>ผู้รับเสิร์ฟ</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/50"
                    style={{ backgroundColor: teamAPlayers[1]?.avatarColor || teamAPlayers[0]?.avatarColor || '#10b981' }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs md:text-sm font-bold text-white block truncate drop-shadow">
                      {isServerA_Left
                        ? teamAPlayers[0]?.name
                        : teamAPlayers[1]?.name || teamAPlayers[0]?.name}
                    </span>
                    <span className="text-[10px] text-emerald-300/80 block">
                      {isServerA_Left ? 'ผู้เสิร์ฟ' : isReceiverA_Left ? 'ผู้รับเสิร์ฟ' : 'คู่ขา (Partner)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom-Left Box: Team A Right Court (Even Points) */}
              <div
                className={`p-3 md:p-4 flex flex-col justify-between transition-all ${
                  isServerA_Right
                    ? 'bg-emerald-500/30 ring-2 ring-inset ring-emerald-400'
                    : isReceiverA_Right
                    ? 'bg-blue-500/25 ring-2 ring-inset ring-blue-400'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-700/60">
                    ช่องขวา (แต้มคู่)
                  </span>
                  {isServerA_Right && (
                    <span className="text-xs font-black text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-full border border-emerald-400 flex items-center gap-1 shadow-lg animate-pulse">
                      <span>🏸</span>
                      <span>กำลังเสิร์ฟ ({scoreA})</span>
                    </span>
                  )}
                  {isReceiverA_Right && (
                    <span className="text-xs font-black text-blue-300 bg-blue-950/90 px-2.5 py-1 rounded-full border border-blue-400 flex items-center gap-1 shadow-lg animate-pulse">
                      <span>🎯</span>
                      <span>ผู้รับเสิร์ฟ</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/50"
                    style={{ backgroundColor: teamAPlayers[0]?.avatarColor || '#10b981' }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs md:text-sm font-bold text-white block truncate drop-shadow">
                      {isServerA_Right
                        ? teamAPlayers[0]?.name
                        : teamAPlayers[1]?.name || teamAPlayers[0]?.name}
                    </span>
                    <span className="text-[10px] text-emerald-300/80 block">
                      {isServerA_Right ? 'ผู้เสิร์ฟ' : isReceiverA_Right ? 'ผู้รับเสิร์ฟ' : 'คู่ขา (Partner)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* TEAM B SIDE (RIGHT HALF OF COURT - EXACTLY ALIGNED WITH COL 2) */}
            {/* -------------------------------------------------------- */}
            <div
              onClick={() => handleScoreChange('B', 1)}
              className="w-1/2 h-full grid grid-rows-2 relative cursor-pointer group"
              title="แตะสนามฝั่งขวาเพื่อ +1 แต้มให้ทีม B"
            >
              {/* Short Service Line (near net) */}
              <div className="absolute top-2 bottom-2 left-12 border-r border-white/40 pointer-events-none" />
              {/* Back Doubles Long Service Line */}
              <div className="absolute top-2 bottom-2 right-10 border-l border-white/30 pointer-events-none" />

              {/* Top-Right Box: Team B Right Court (Even Points) */}
              <div
                className={`p-3 md:p-4 flex flex-col justify-between border-b border-white/30 transition-all ${
                  isServerB_Right
                    ? 'bg-blue-500/30 ring-2 ring-inset ring-blue-400'
                    : isReceiverB_Right
                    ? 'bg-emerald-500/25 ring-2 ring-inset ring-emerald-400'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-700/60">
                    ช่องขวา (แต้มคู่)
                  </span>
                  {isServerB_Right && (
                    <span className="text-xs font-black text-blue-300 bg-blue-950/90 px-2.5 py-1 rounded-full border border-blue-400 flex items-center gap-1 shadow-lg animate-pulse">
                      <span>🏸</span>
                      <span>กำลังเสิร์ฟ ({scoreB})</span>
                    </span>
                  )}
                  {isReceiverB_Right && (
                    <span className="text-xs font-black text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-full border border-emerald-400 flex items-center gap-1 shadow-lg animate-pulse">
                      <span>🎯</span>
                      <span>ผู้รับเสิร์ฟ</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/50"
                    style={{ backgroundColor: teamBPlayers[0]?.avatarColor || '#3b82f6' }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs md:text-sm font-bold text-white block truncate drop-shadow">
                      {isServerB_Right
                        ? teamBPlayers[0]?.name
                        : teamBPlayers[1]?.name || teamBPlayers[0]?.name}
                    </span>
                    <span className="text-[10px] text-blue-300/80 block">
                      {isServerB_Right ? 'ผู้เสิร์ฟ' : isReceiverB_Right ? 'ผู้รับเสิร์ฟ' : 'คู่ขา (Partner)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom-Right Box: Team B Left Court (Odd Points) */}
              <div
                className={`p-3 md:p-4 flex flex-col justify-between transition-all ${
                  isServerB_Left
                    ? 'bg-blue-500/30 ring-2 ring-inset ring-blue-400'
                    : isReceiverB_Left
                    ? 'bg-emerald-500/25 ring-2 ring-inset ring-emerald-400'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-700/60">
                    ช่องซ้าย (แต้มคี่)
                  </span>
                  {isServerB_Left && (
                    <span className="text-xs font-black text-blue-300 bg-blue-950/90 px-2.5 py-1 rounded-full border border-blue-400 flex items-center gap-1 shadow-lg animate-pulse">
                      <span>🏸</span>
                      <span>กำลังเสิร์ฟ ({scoreB})</span>
                    </span>
                  )}
                  {isReceiverB_Left && (
                    <span className="text-xs font-black text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-full border border-emerald-400 flex items-center gap-1 shadow-lg animate-pulse">
                      <span>🎯</span>
                      <span>ผู้รับเสิร์ฟ</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/50"
                    style={{ backgroundColor: teamBPlayers[1]?.avatarColor || teamBPlayers[0]?.avatarColor || '#3b82f6' }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs md:text-sm font-bold text-white block truncate drop-shadow">
                      {isServerB_Left
                        ? teamBPlayers[0]?.name
                        : teamBPlayers[1]?.name || teamBPlayers[0]?.name}
                    </span>
                    <span className="text-[10px] text-blue-300/80 block">
                      {isServerB_Left ? 'ผู้เสิร์ฟ' : isReceiverB_Left ? 'ผู้รับเสิร์ฟ' : 'คู่ขา (Partner)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MATCHED SCORE ACTION BUTTONS (Aligned 1-to-1 with Court Halves) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 pt-2">
          {/* Column 1 (Left): Buttons for Team A - Exactly under Left Half */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScoreChange('A', 1)}
                disabled={isGameOver}
                className="flex-1 py-4 md:py-5 text-base md:text-xl font-black bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40 text-slate-950 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 select-none"
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
                <span>+1 แต้ม ทีม A</span>
              </button>
              <button
                onClick={() => handleScoreChange('A', -1)}
                disabled={scoreA <= 0}
                className="px-4 md:px-5 py-4 md:py-5 text-xs md:text-sm font-bold bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-30 text-slate-300 rounded-2xl transition-colors border border-slate-700/60"
                title="ลบ 1 แต้ม (แก้แต้มผิด)"
              >
                -1
              </button>
            </div>
            <div className="text-[11px] text-slate-500 text-center">
              แตะบนปุ่ม หรือแตะบนสนามฝั่งซ้าย
            </div>
          </div>

          {/* Column 2 (Right): Buttons for Team B - Exactly under Right Half */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScoreChange('B', 1)}
                disabled={isGameOver}
                className="flex-1 py-4 md:py-5 text-base md:text-xl font-black bg-blue-500 hover:bg-blue-400 active:scale-[0.98] disabled:opacity-40 text-white rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 select-none"
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
                <span>+1 แต้ม ทีม B</span>
              </button>
              <button
                onClick={() => handleScoreChange('B', -1)}
                disabled={scoreB <= 0}
                className="px-4 md:px-5 py-4 md:py-5 text-xs md:text-sm font-bold bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-30 text-slate-300 rounded-2xl transition-colors border border-slate-700/60"
                title="ลบ 1 แต้ม (แก้แต้มผิด)"
              >
                -1
              </button>
            </div>
            <div className="text-[11px] text-slate-500 text-center">
              แตะบนปุ่ม หรือแตะบนสนามฝั่งขวา
            </div>
          </div>
        </div>

        {/* Bottom Scoreboard Controls & Utilities */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (court && court.isOccupied) {
                  switchCourtServingSide(court.id);
                } else {
                  setStandaloneServing(standaloneServing === 'A' ? 'B' : 'A');
                }
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium flex items-center gap-1.5"
            >
              <span>🏸 เปลี่ยนฝั่งเสิร์ฟ</span>
            </button>
            <button
              onClick={() => {
                if (court && court.isOccupied) {
                  swapCourtSides(court.id);
                } else {
                  const tmp = standaloneScoreA;
                  setStandaloneScoreA(standaloneScoreB);
                  setStandaloneScoreB(tmp);
                  const nameTmp = standaloneTeamAName;
                  setStandaloneTeamAName(standaloneTeamBName);
                  setStandaloneTeamBName(nameTmp);
                }
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>สลับฝั่งสนาม</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!court?.isOccupied ? (
              <button
                onClick={handleResetStandalone}
                className="px-3.5 py-2 text-slate-400 hover:text-white transition-colors"
              >
                รีเซ็ตแต้ม
              </button>
            ) : (
              <button
                onClick={() => finishCourtMatch(court.id)}
                className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" />
                <span>บันทึกและจบแมตช์</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
