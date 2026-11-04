/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UserPlus,
  Trash2,
  Edit2,
  Check,
  X,
  Users,
  Trophy,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useBadminton } from '../context/BadmintonContext';
import { Player, SkillLevel, Gender } from '../types/badminton';

export const PlayerManager: React.FC = () => {
  const {
    players,
    addPlayer,
    updatePlayer,
    deletePlayer,
    togglePlayerStatus,
    togglePlayerPayment,
    loadSampleSquad,
  } = useBadminton();

  const [isAdding, setIsAdding] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [gender, setGender] = useState<Gender>('male');
  const [avatarColor, setAvatarColor] = useState('#10b981');

  const COLOR_PALETTE = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#ec4899', // pink
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#14b8a6', // teal
    '#f43f5e', // rose
    '#84cc16', // lime
  ];

  const handleStartAdd = () => {
    setName('');
    setNickname('');
    setSkillLevel('intermediate');
    setGender('male');
    setAvatarColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
    setIsAdding(true);
    setEditingPlayerId(null);
  };

  const handleStartEdit = (player: Player) => {
    setName(player.name);
    setNickname(player.nickname || '');
    setSkillLevel(player.skillLevel);
    setGender(player.gender || 'male');
    setAvatarColor(player.avatarColor);
    setEditingPlayerId(player.id);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPlayerId) {
      updatePlayer(editingPlayerId, {
        name: name.trim(),
        nickname: nickname.trim() || name.trim().split(' ')[0],
        skillLevel,
        gender,
        avatarColor,
      });
      setEditingPlayerId(null);
    } else {
      addPlayer({
        name: name.trim(),
        nickname: nickname.trim() || name.trim().split(' ')[0],
        skillLevel,
        gender,
        avatarColor,
        status: 'ready',
      });
      setIsAdding(false);
    }
  };

  const totalGames = players.reduce((acc, p) => acc + p.gamesPlayed, 0);
  const avgGames = players.length > 0 ? (totalGames / players.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>ทำเนียบสมาชิกในก๊วน ({players.length} คน)</span>
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span>ลงเล่นทั้งหมด {totalGames} คน-เกม</span>
            <span aria-hidden="true">·</span>
            <span>เฉลี่ยคนละ {avgGames} เกม</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">
              จ่ายเงินแล้ว {players.filter((p) => p.hasPaid).length}/{players.length} คน
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSampleSquad}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            โหลดก๊วนตัวอย่าง
          </button>
          <button
            onClick={handleStartAdd}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-98 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มผู้เล่นใหม่</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form Modal or Inline Drawer */}
      {(isAdding || editingPlayerId) && (
        <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{editingPlayerId ? 'แก้ไขข้อมูลผู้เล่น' : 'ลงทะเบียนผู้เล่นใหม่ในก๊วน'}</span>
            </h3>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingPlayerId(null);
              }}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ชื่อ-นามสกุล / ชื่อที่เรียกในสนาม *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สมชาย รักแบด"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ชื่อเล่น (สั้นๆ แสดงบนสกอร์บอร์ด)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ชาย"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ระดับฝีมือ (ใช้คำนวณสมดุลทีม)
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="beginner">Beginner (มือใหม่ / เน้นออกกำลังกาย)</option>
                  <option value="intermediate">Intermediate (มือกลาง / เบสิกแน่น)</option>
                  <option value="advanced">Advanced (มือเก่ง / นักกีฬา / ตีเร็ว)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">เพศ</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="male">ชาย (Male)</option>
                  <option value="female">หญิง (Female)</option>
                  <option value="unspecified">ไม่ระบุ</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">สีประจำตัว</label>
                <div className="flex items-center gap-2 pt-1">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setAvatarColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        avatarColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingPlayerId(null);
                }}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md active:scale-95"
              >
                {editingPlayerId ? 'บันทึกการแก้ไข' : 'บันทึกผู้เล่น'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Players List Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {players.map((player) => {
          const winRate =
            player.gamesPlayed > 0
              ? Math.round((player.gamesWon / player.gamesPlayed) * 100)
              : 0;

          return (
            <div
              key={player.id}
              className={`bg-slate-900 rounded-2xl border p-4 transition-all relative ${
                player.status === 'playing'
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : player.status === 'resting'
                  ? 'border-amber-500/30 bg-amber-950/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header row: Avatar + Name + Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-slate-950 shadow-sm shrink-0"
                    style={{ backgroundColor: player.avatarColor }}
                  >
                    {(player.nickname || player.name).slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{player.name}</h4>
                    <div className="text-[11px] text-slate-400">
                      <span>{player.gender === 'female' ? 'หญิง' : 'ชาย'}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="capitalize">{player.skillLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Button */}
                <div>
                  {player.status === 'playing' ? (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>ในสนาม</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => togglePlayerStatus(player.id)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                        player.status === 'ready'
                          ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                          : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                      }`}
                    >
                      {player.status === 'ready' ? 'พร้อมเล่น' : 'พักเหนื่อย'}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-950/60 rounded-xl text-center border border-slate-800/80 mb-3 text-xs">
                <div>
                  <div className="text-slate-400 text-[10px]">ลงเล่น</div>
                  <div className="font-bold text-white font-mono">{player.gamesPlayed} เกม</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">ชนะ</div>
                  <div className="font-bold text-emerald-400 font-mono">{player.gamesWon} เกม</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Win Rate</div>
                  <div className="font-bold text-blue-400 font-mono">{winRate}%</div>
                </div>
              </div>

              {/* Payment Status & Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => togglePlayerPayment(player.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    player.hasPaid
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                      : 'text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{player.hasPaid ? 'จ่ายเงินแล้ว' : 'ยังไม่จ่าย'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(player)}
                    title="แก้ไขข้อมูล"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deletePlayer(player.id)}
                    title="ลบผู้เล่น"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
