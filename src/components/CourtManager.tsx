/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Trophy,
  Users,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  ChevronRight,
  Maximize2,
  Coffee,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  Share2,
  UserPlus,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { useBadminton } from '../context/BadmintonContext';
import { ManualMatchModal } from './ManualMatchModal';
import { JoinSessionModal } from './JoinSessionModal';
import { NavTab } from './Navbar';

interface CourtManagerProps {
  onNavigateToTab: (tab: NavTab) => void;
  onOpenScoreboardForCourt: (courtId: string) => void;
}

export const CourtManager: React.FC<CourtManagerProps> = ({
  onNavigateToTab,
  onOpenScoreboardForCourt,
}) => {
  const {
    courts,
    players,
    sessionInfo,
    addCourt,
    removeCourt,
    autoMatchCourt,
    updateCourtScore,
    swapCourtSides,
    switchCourtServingSide,
    finishCourtMatch,
    cancelCourtMatch,
    togglePlayerStatus,
    loadSampleSquad,
    addPlayer,
    joinCourtSlot,
    leaveCourtSlot,
  } = useBadminton();

  const [manualModalCourtId, setManualModalCourtId] = useState<string | null>(null);
  const [benchFilter, setBenchFilter] = useState<'all' | 'ready' | 'resting'>('all');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerSkill, setNewPlayerSkill] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [showAddPlayerInput, setShowAddPlayerInput] = useState(false);
  const [matchmakerNotice, setMatchmakerNotice] = useState<string | null>(null);

  // Join Court & Share Session modal state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinModalCourtId, setJoinModalCourtId] = useState<string | undefined>();
  const [joinModalTeam, setJoinModalTeam] = useState<'teamA' | 'teamB' | undefined>();
  const [joinModalTab, setJoinModalTab] = useState<'join' | 'scan' | 'share'>('join');
  const [copiedCodeBanner, setCopiedCodeBanner] = useState(false);

  const handleOpenJoinForSlot = (courtId: string, team: 'teamA' | 'teamB') => {
    setJoinModalCourtId(courtId);
    setJoinModalTeam(team);
    setJoinModalTab('join');
    setJoinModalOpen(true);
  };

  const handleOpenShareModal = () => {
    setJoinModalTab('share');
    setJoinModalOpen(true);
  };

  const handleOpenScanModal = () => {
    setJoinModalCourtId(undefined);
    setJoinModalTeam(undefined);
    setJoinModalTab('scan');
    setJoinModalOpen(true);
  };

  const handleOpenGeneralJoinModal = () => {
    setJoinModalCourtId(undefined);
    setJoinModalTeam(undefined);
    setJoinModalTab('join');
    setJoinModalOpen(true);
  };

  const handleQuickCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionInfo?.inviteCode || 'BADM-8899');
      setCopiedCodeBanner(true);
      setTimeout(() => setCopiedCodeBanner(false), 2000);
    } catch {
      // ignore
    }
  };

  // Live timer tick for active courts
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (startTime?: number) => {
    if (!startTime) return '00:00';
    const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRestMinutes = (timestamp: number) => {
    const mins = Math.floor(Math.max(0, Date.now() - timestamp) / 60000);
    if (mins < 1) return 'เพิ่งลงมา';
    return `พักแล้ว ${mins} นาที`;
  };

  const handleAutoMatch = (courtId: string) => {
    const res = autoMatchCourt(courtId, 'doubles');
    setMatchmakerNotice(res.message);
    setTimeout(() => {
      setMatchmakerNotice(null);
    }, 5000);
  };

  const handleAutoMatchAllFreeCourts = () => {
    const freeCourts = courts.filter((c) => !c.isOccupied);
    let matchedCount = 0;
    for (const c of freeCourts) {
      const res = autoMatchCourt(c.id, 'doubles');
      if (res.success) matchedCount++;
    }
    if (matchedCount > 0) {
      setMatchmakerNotice(`จัดคิวลงสนามสำเร็จ ${matchedCount} คอร์ทเรียบร้อยแล้ว`);
    } else {
      setMatchmakerNotice('ผู้เล่นในสถานะ "พร้อมเล่น" ไม่เพียงพอสำหรับจัดคิวลงคอร์ท');
    }
    setTimeout(() => setMatchmakerNotice(null), 4000);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const colors = ['#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4', '#14b8a6', '#f43f5e'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addPlayer({
      name: newPlayerName.trim(),
      nickname: newPlayerName.trim().split(' ')[0],
      skillLevel: newPlayerSkill,
      status: 'ready',
      avatarColor: randomColor,
    });

    setNewPlayerName('');
    setShowAddPlayerInput(false);
  };

  const readyPlayersCount = players.filter((p) => p.status === 'ready').length;
  const restingPlayersCount = players.filter((p) => p.status === 'resting').length;
  const playingPlayersCount = players.filter((p) => p.status === 'playing').length;
  const activeCourtsCount = courts.filter((c) => c.isOccupied).length;

  const filteredBenchPlayers = players.filter((p) => {
    if (p.status === 'playing') return false;
    if (benchFilter === 'ready') return p.status === 'ready';
    if (benchFilter === 'resting') return p.status === 'resting';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Session Hero Banner */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-900/80 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
              <span>{sessionInfo.venueName}</span>
              <span aria-hidden="true">·</span>
              <span>{sessionInfo.date}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {sessionInfo.sessionName}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
              <span>ผู้เล่นทั้งหมด {players.length} คน</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">กำลังแข่ง {playingPlayersCount} คน</span>
              <span aria-hidden="true">·</span>
              <span className="text-blue-400 font-medium">รอคิว {readyPlayersCount} คน</span>
              {restingPlayersCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400">พัก {restingPlayersCount} คน</span>
                </>
              )}
            </div>
            {/* Invite Code Quick Pill */}
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">รหัสชวนเพื่อนเข้าก๊วน:</span>
              <button
                type="button"
                onClick={handleQuickCopyCode}
                title="คลิกเพื่อคัดลอกรหัสเข้าก๊วน"
                className="px-2.5 py-1 bg-slate-950/80 hover:bg-slate-950 border border-emerald-500/40 rounded-lg text-emerald-400 font-mono text-xs font-bold tracking-wider flex items-center gap-1.5 transition-colors group"
              >
                <span>{sessionInfo?.inviteCode || 'BADM-8899'}</span>
                {copiedCodeBanner ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                )}
              </button>
              {copiedCodeBanner && (
                <span className="text-[10px] text-emerald-400 animate-fade-in font-medium">
                  คัดลอกรหัสแล้ว!
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenGeneralJoinModal}
              className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-98 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>ขอร่วมเล่น / จอยก๊วน</span>
            </button>
            <button
              onClick={handleOpenShareModal}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700/60"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>แชร์รหัส &amp; QR</span>
            </button>
            <button
              onClick={handleOpenScanModal}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700/60"
              title="เปิดกล้องสแกน QR Code เพื่อเข้าก๊วน"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>สแกน QR</span>
            </button>
            <button
              onClick={handleAutoMatchAllFreeCourts}
              disabled={courts.every((c) => c.isOccupied) || readyPlayersCount < 2}
              className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all border border-slate-700/60 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>จัดคิวอัตโนมัติ</span>
            </button>
            <button
              onClick={() => addCourt()}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-850 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 border border-slate-800"
              title="เพิ่มคอร์ทใหม่"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>เพิ่มคอร์ท</span>
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {matchmakerNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{matchmakerNotice}</span>
          </div>
        )}
      </section>

      {/* Main Grid: Courts & Waiting Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Courts (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>สนามแข่งขัน</span>
              <span className="text-xs font-normal text-slate-400">
                ({activeCourtsCount}/{courts.length} คอร์ทกำลังใช้งาน)
              </span>
            </h2>
            <span className="text-xs text-slate-400">ระบบแต้มเต็ม {sessionInfo.maxPoints} แต้ม</span>
          </div>

          {courts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
              <p className="text-slate-400 text-sm mb-3">ยังไม่มีคอร์ทในการแข่งขันนี้</p>
              <button
                onClick={() => addCourt()}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-xl"
              >
                + เพิ่มคอร์ท 1
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {courts.map((court) => {
                if (court.isOccupied) {
                  return (
                    /* Occupied Court Card */
                    <div
                      key={court.id}
                      className="bg-slate-900 rounded-2xl border border-emerald-500/40 p-4 md:p-5 shadow-sm space-y-4 relative overflow-hidden"
                    >
                      {/* Top bar of Court Card */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <h3 className="text-sm font-bold text-white">{court.name}</h3>
                          <span className="text-xs text-emerald-400 font-medium">กำลังแข่งขัน</span>
                          <span className="text-xs text-slate-500">· {court.matchType === 'doubles' ? 'ประเภทคู่' : 'ประเภทเดี่ยว'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="tabular-nums">{formatDuration(court.matchStartedAt)}</span>
                        </div>
                      </div>

                      {/* Teams and Score Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                        {/* Team A */}
                        <div
                          className={`p-3 rounded-xl border transition-colors ${
                            court.servingSide === 'teamA'
                              ? 'bg-emerald-950/20 border-emerald-500/50'
                              : 'bg-slate-950/40 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              {court.servingSide === 'teamA' && <span>🏸</span>}
                              <span>ทีม A</span>
                            </span>
                            <span className="text-2xl font-black text-white font-mono tabular-nums">
                              {court.scoreA}
                            </span>
                          </div>
                          <div className="space-y-1 mb-3 min-h-[44px]">
                            {court.teamA.map((p) => (
                              <div key={p.id} className="text-xs text-slate-200 flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.avatarColor }} />
                                  <span className="font-medium">{p.name}</span>
                                </div>
                                <button
                                  onClick={() => leaveCourtSlot(court.id, p.id)}
                                  className="text-[10px] text-slate-500 hover:text-rose-400 px-1"
                                  title="ออกจากคอร์ท"
                                >
                                  ออก
                                </button>
                              </div>
                            ))}
                            {court.teamA.length < (court.matchType === 'singles' ? 1 : 2) && (
                              <button
                                onClick={() => handleOpenJoinForSlot(court.id, 'teamA')}
                                className="w-full py-1 px-2 border border-dashed border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 text-[11px] rounded flex items-center justify-center gap-1 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ จอยทีม A (ว่าง 1 ที่)</span>
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1 pt-1 border-t border-slate-800/80">
                            <button
                              onClick={() => updateCourtScore(court.id, 'teamA', 1)}
                              className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors active:scale-95"
                            >
                              +1 แต้ม
                            </button>
                            <button
                              onClick={() => updateCourtScore(court.id, 'teamA', -1)}
                              disabled={court.scoreA <= 0}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg disabled:opacity-30"
                            >
                              -1
                            </button>
                          </div>
                        </div>

                        {/* Team B */}
                        <div
                          className={`p-3 rounded-xl border transition-colors ${
                            court.servingSide === 'teamB'
                              ? 'bg-blue-950/20 border-blue-500/50'
                              : 'bg-slate-950/40 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                              {court.servingSide === 'teamB' && <span>🏸</span>}
                              <span>ทีม B</span>
                            </span>
                            <span className="text-2xl font-black text-white font-mono tabular-nums">
                              {court.scoreB}
                            </span>
                          </div>
                          <div className="space-y-1 mb-3 min-h-[44px]">
                            {court.teamB.map((p) => (
                              <div key={p.id} className="text-xs text-slate-200 flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.avatarColor }} />
                                  <span className="font-medium">{p.name}</span>
                                </div>
                                <button
                                  onClick={() => leaveCourtSlot(court.id, p.id)}
                                  className="text-[10px] text-slate-500 hover:text-rose-400 px-1"
                                  title="ออกจากคอร์ท"
                                >
                                  ออก
                                </button>
                              </div>
                            ))}
                            {court.teamB.length < (court.matchType === 'singles' ? 1 : 2) && (
                              <button
                                onClick={() => handleOpenJoinForSlot(court.id, 'teamB')}
                                className="w-full py-1 px-2 border border-dashed border-blue-500/50 hover:bg-blue-500/10 text-blue-400 text-[11px] rounded flex items-center justify-center gap-1 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ จอยทีม B (ว่าง 1 ที่)</span>
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1 pt-1 border-t border-slate-800/80">
                            <button
                              onClick={() => updateCourtScore(court.id, 'teamB', 1)}
                              className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg transition-colors active:scale-95"
                            >
                              +1 แต้ม
                            </button>
                            <button
                              onClick={() => updateCourtScore(court.id, 'teamB', -1)}
                              disabled={court.scoreB <= 0}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg disabled:opacity-30"
                            >
                              -1
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Court Control Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenScoreboardForCourt(court.id)}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>เปิดสกอร์บอร์ดสด</span>
                          </button>
                          <button
                            onClick={() => swapCourtSides(court.id)}
                            title="สลับฝั่งทีม A / B"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => switchCourtServingSide(court.id)}
                            title="สลับฝั่งเสิร์ฟ"
                            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          >
                            🏸 เสิร์ฟ
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => cancelCourtMatch(court.id)}
                            className="px-2.5 py-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => finishCourtMatch(court.id)}
                            className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>บันทึกจบเกม</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    /* Free / Available Court Card with interactive slot joiners */
                    <div
                      key={court.id}
                      className="bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-emerald-500/40 p-4 md:p-5 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                            <h3 className="text-base font-bold text-white">{court.name}</h3>
                            <span className="text-xs text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded">
                              {court.teamA.length + court.teamB.length === 0
                                ? 'สนามว่าง'
                                : `รอผู้เล่น (${court.teamA.length + court.teamB.length}/${court.matchType === 'singles' ? 2 : 4})`}
                            </span>
                            <span className="text-xs text-slate-500">
                              · {court.matchType === 'doubles' ? 'ประเภทคู่' : 'ประเภทเดี่ยว'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            แตะช่องว่างเพื่อเข้าเล่น หรือกดจัดคิวสุ่มคู่แข่งขัน
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleAutoMatch(court.id)}
                            disabled={readyPlayersCount < 2}
                            className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>จัดคิวสุ่มคู่</span>
                          </button>
                          <button
                            onClick={() => setManualModalCourtId(court.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700/60"
                          >
                            เลือกคู่เอง
                          </button>
                          {courts.length > 1 && (
                            <button
                              onClick={() => removeCourt(court.id)}
                              title="ลบคอร์ทนี้"
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Interactive Slots for Team A and Team B */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Team A Slots */}
                        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              <span>ทีม A</span>
                              <span className="text-[11px] text-slate-400 font-normal">
                                ({court.teamA.length}/{court.matchType === 'singles' ? 1 : 2} คน)
                              </span>
                            </span>
                          </div>
                          <div className="space-y-1.5 min-h-[38px]">
                            {court.teamA.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between p-2 bg-slate-900 rounded-lg text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: p.avatarColor }}
                                  />
                                  <span className="font-semibold text-slate-200">{p.name}</span>
                                </div>
                                <button
                                  onClick={() => leaveCourtSlot(court.id, p.id)}
                                  className="text-slate-500 hover:text-rose-400 text-[11px] px-1 transition-colors"
                                  title="ออกจากช่องนี้"
                                >
                                  ออก
                                </button>
                              </div>
                            ))}
                            {Array.from({
                              length: Math.max(0, (court.matchType === 'singles' ? 1 : 2) - court.teamA.length),
                            }).map((_, idx) => (
                              <button
                                key={`empty-a-${idx}`}
                                onClick={() => handleOpenJoinForSlot(court.id, 'teamA')}
                                className="w-full py-2.5 px-3 border border-dashed border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/10 text-emerald-400 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">+ ขอเข้าเล่นทีม A (ว่าง)</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Team B Slots */}
                        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-blue-400 flex items-center gap-1">
                              <span>ทีม B</span>
                              <span className="text-[11px] text-slate-400 font-normal">
                                ({court.teamB.length}/{court.matchType === 'singles' ? 1 : 2} คน)
                              </span>
                            </span>
                          </div>
                          <div className="space-y-1.5 min-h-[38px]">
                            {court.teamB.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between p-2 bg-slate-900 rounded-lg text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: p.avatarColor }}
                                  />
                                  <span className="font-semibold text-slate-200">{p.name}</span>
                                </div>
                                <button
                                  onClick={() => leaveCourtSlot(court.id, p.id)}
                                  className="text-slate-500 hover:text-rose-400 text-[11px] px-1 transition-colors"
                                  title="ออกจากช่องนี้"
                                >
                                  ออก
                                </button>
                              </div>
                            ))}
                            {Array.from({
                              length: Math.max(0, (court.matchType === 'singles' ? 1 : 2) - court.teamB.length),
                            }).map((_, idx) => (
                              <button
                                key={`empty-b-${idx}`}
                                onClick={() => handleOpenJoinForSlot(court.id, 'teamB')}
                                className="w-full py-2.5 px-3 border border-dashed border-blue-500/40 hover:border-blue-400 hover:bg-blue-500/10 text-blue-400 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">+ ขอเข้าเล่นทีม B (ว่าง)</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>

        {/* Right Column: Waiting Bench (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>คิวรอเล่น (Waiting Bench)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  แตะที่ผู้เล่นเพื่อสลับ พร้อมเล่น / พักเหนื่อย
                </p>
              </div>
              <button
                onClick={() => setShowAddPlayerInput(!showAddPlayerInput)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                title="เพิ่มผู้เล่นใหม่"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Player Form */}
            {showAddPlayerInput && (
              <form onSubmit={handleCreatePlayer} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <input
                  type="text"
                  placeholder="ชื่อผู้เล่น / ชื่อเล่น"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={newPlayerSkill}
                    onChange={(e) => setNewPlayerSkill(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                    className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none"
                  >
                    <option value="beginner">Beginner (มือใหม่)</option>
                    <option value="intermediate">Intermediate (มือกลาง)</option>
                    <option value="advanced">Advanced (มือเก่ง)</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-bold bg-emerald-500 text-slate-950 rounded-lg"
                  >
                    เพิ่ม
                  </button>
                </div>
              </form>
            )}

            {/* Bench Segmented Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setBenchFilter('all')}
                className={`flex-1 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  benchFilter === 'all'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ทั้งหมด ({players.filter((p) => p.status !== 'playing').length})
              </button>
              <button
                onClick={() => setBenchFilter('ready')}
                className={`flex-1 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  benchFilter === 'ready'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                พร้อม ({readyPlayersCount})
              </button>
              <button
                onClick={() => setBenchFilter('resting')}
                className={`flex-1 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  benchFilter === 'resting'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                พัก ({restingPlayersCount})
              </button>
            </div>

            {/* Players in Bench list */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredBenchPlayers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  {players.length === 0 ? (
                    <div>
                      <p className="mb-2">ยังไม่มีรายชื่อผู้เล่น</p>
                      <button
                        onClick={loadSampleSquad}
                        className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-semibold rounded-lg text-xs"
                      >
                        โหลดก๊วนตัวอย่าง 8 คน
                      </button>
                    </div>
                  ) : (
                    'ไม่มีผู้เล่นในหมวดนี้ (ทุกคนกำลังเล่นอยู่ในสนาม)'
                  )}
                </div>
              ) : (
                filteredBenchPlayers.map((player) => {
                  const isReady = player.status === 'ready';
                  return (
                    <div
                      key={player.id}
                      onClick={() => togglePlayerStatus(player.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isReady
                          ? 'bg-slate-950/40 border-slate-800/80 hover:border-emerald-500/40'
                          : 'bg-amber-950/10 border-amber-500/20 opacity-80 hover:opacity-100'
                      }`}
                      title={isReady ? 'คลิกเพื่อเปลี่ยนเป็นสถานะพักเหนื่อย' : 'คลิกเพื่อเปลี่ยนเป็นสถานะพร้อมเล่น'}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: player.avatarColor }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                            <span>{player.name}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({player.skillLevel})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>เล่น {player.gamesPlayed} เกม</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatRestMinutes(player.restStartedAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isReady ? (
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            พร้อม
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Coffee className="w-3 h-3" />
                            <span>พัก</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick footer action */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => onNavigateToTab('players')}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>จัดการรายชื่อและสถิติ</span>
                <ChevronRight className="w-3 h-3" />
              </button>
              <button
                onClick={loadSampleSquad}
                className="text-slate-400 hover:text-slate-200"
              >
                รีเซ็ตก๊วนตัวอย่าง
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Matchmaker Modal */}
      {manualModalCourtId && (
        <ManualMatchModal
          courtId={manualModalCourtId}
          courtName={courts.find((c) => c.id === manualModalCourtId)?.name || 'คอร์ท'}
          onClose={() => setManualModalCourtId(null)}
        />
      )}

      {/* Join Session & Court Modal */}
      <JoinSessionModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        preselectedCourtId={joinModalCourtId}
        preselectedTeam={joinModalTeam}
        defaultTab={joinModalTab}
      />
    </div>
  );
};
