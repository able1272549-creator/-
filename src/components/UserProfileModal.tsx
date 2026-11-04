/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, LogOut, User, Mail, ShieldCheck, Trophy, Sparkles, Check, Edit2, Link } from 'lucide-react';
import { useBadminton } from '../context/BadmintonContext';
import { SkillLevel } from '../types/badminton';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout, updateUserProfile, players } = useBadminton();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(currentUser?.skillLevel || 'intermediate');
  const [linkedPlayerId, setLinkedPlayerId] = useState(currentUser?.linkedPlayerId || '');

  if (!isOpen || !currentUser) return null;

  const linkedPlayer = players.find((p) => p.id === (currentUser.linkedPlayerId || linkedPlayerId));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      nickname: nickname.trim() || currentUser.nickname,
      skillLevel,
      linkedPlayerId: linkedPlayerId || undefined,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4 pt-1">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-slate-950 shadow-md relative shrink-0"
            style={{ backgroundColor: currentUser.avatarColor || '#10b981' }}
          >
            {currentUser.nickname?.slice(0, 1) || currentUser.name?.slice(0, 1) || 'U'}
            {currentUser.provider === 'gmail' && (
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow"
                title="เชื่อมต่อด้วย Google / Gmail"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white truncate">{currentUser.name}</h3>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                {currentUser.role === 'organizer' ? 'หัวหน้าก๊วน' : 'สมาชิก'}
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{currentUser.rememberMe ? 'จดจำผู้ใช้บนอุปกรณ์นี้' : 'เข้าสู่ระบบชั่วคราว'}</span>
            </div>
          </div>
        </div>

        {/* Linked Player In-Court Stats */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>สถิติการเล่นในสนามก๊วนนี้</span>
            </span>
            {linkedPlayer && (
              <span className="text-[11px] text-slate-400">
                เชื่อมกับ: <strong className="text-white">{linkedPlayer.name}</strong>
              </span>
            )}
          </div>

          {linkedPlayer ? (
            <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">ลงแข่ง</span>
                <span className="font-bold text-white font-mono text-sm">{linkedPlayer.gamesPlayed} เกม</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">ชนะ</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{linkedPlayer.gamesWon} เกม</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Win Rate</span>
                <span className="font-bold text-blue-400 font-mono text-sm">
                  {linkedPlayer.gamesPlayed > 0
                    ? `${Math.round((linkedPlayer.gamesWon / linkedPlayer.gamesPlayed) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-1">
              ยังไม่ได้เชื่อมโยงกับรายชื่อผู้เล่นในสนาม (สามารถเลือกเชื่อมโยงได้ด้านล่าง)
            </div>
          )}
        </div>

        {/* Edit Form or Account Info */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3 pt-1 border-t border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                ชื่อเล่นที่แสดง
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                ระดับฝีมือ
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                เชื่อมโยงกับผู้เล่นในสนาม
              </label>
              <select
                value={linkedPlayerId}
                onChange={(e) => setLinkedPlayerId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- ไม่เชื่อมโยง --</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.skillLevel})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">ระดับฝีมือ:</span>
              <span className="font-semibold text-white capitalize">{currentUser.skillLevel}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">วิธีลงชื่อเข้าใช้:</span>
              <span className="font-semibold text-white">
                {currentUser.provider === 'gmail' ? 'Google / Gmail' : 'อีเมลและรหัสผ่าน'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">ลงทะเบียนเมื่อ:</span>
              <span className="font-mono text-slate-300">
                {new Date(currentUser.registeredAt).toLocaleDateString('th-TH')}
              </span>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>แก้ไขข้อมูลโปรไฟล์</span>
            </button>
          </div>
        )}

        {/* Footer: Logout */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">BadmintonHub Identity</span>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
