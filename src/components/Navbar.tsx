/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Plus, User, LogIn, UserPlus, QrCode } from 'lucide-react';
import { useBadminton } from '../context/BadmintonContext';

export type NavTab = 'courts' | 'scoreboard' | 'players' | 'expenses' | 'history';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickMatch?: () => void;
  onOpenAuthModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenJoinModal?: (tab?: 'join' | 'scan' | 'share') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickMatch,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenJoinModal,
}) => {
  const {
    soundMuted,
    toggleSound,
    theme,
    toggleTheme,
    voiceLanguage,
    toggleVoiceLanguage,
    currentUser,
  } = useBadminton();

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'courts', label: 'คอร์ท & จัดคิว' },
    { id: 'scoreboard', label: 'สกอร์บอร์ดสด' },
    { id: 'players', label: 'ผู้เล่นในก๊วน' },
    { id: 'expenses', label: 'หารค่าใช้จ่าย' },
    { id: 'history', label: 'ประวัติแมตช์' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('courts')}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm shadow-emerald-500/20">
            🏸
          </span>
          <span className="font-extrabold tracking-tight">BadmintonHub</span>
        </button>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
                  isActive
                    ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                    : 'hover:text-white hover:border-b-2 hover:border-slate-600'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary utility / action controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleSound}
            title={soundMuted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label={soundMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="เปลี่ยนธีมสี"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          <button
            onClick={toggleVoiceLanguage}
            title={`สลับภาษาเสียงขานแต้ม (ปัจจุบัน: ${voiceLanguage === 'th' ? 'ไทย' : 'English'})`}
            className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
            aria-label="สลับภาษาเสียงขานแต้ม"
          >
            {voiceLanguage === 'th' ? '🇹🇭 TH' : '🇬🇧 EN'}
          </button>

          {/* User Account / Profile Chip */}
          {currentUser ? (
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all text-xs text-left"
              title="ดูโปรไฟล์และบัญชีผู้ใช้งาน"
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-950 font-bold text-[11px] shadow-sm relative shrink-0"
                style={{ backgroundColor: currentUser.avatarColor || '#10b981' }}
              >
                {currentUser.nickname?.slice(0, 1) || currentUser.name?.slice(0, 1) || 'U'}
                {currentUser.provider === 'gmail' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-slate-900" />
                )}
              </div>
              <span className="font-semibold text-white max-w-[90px] truncate hidden sm:inline">
                {currentUser.nickname || currentUser.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 border border-slate-700"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}

          {onOpenJoinModal && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onOpenJoinModal('scan')}
                className="p-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-colors shrink-0 flex items-center justify-center active:scale-95"
                title="เปิดกล้องสแกน QR Code เข้าก๊วน"
                aria-label="เปิดกล้องสแกน QR Code เข้าก๊วน"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                onClick={() => onOpenJoinModal('join')}
                className="px-2.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95"
                title="ขอเข้าร่วมเล่นในคอร์ท หรือแชร์รหัสก๊วน"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ขอร่วมเล่น</span>
              </button>
            </div>
          )}

          {onOpenQuickMatch && (
            <button
              onClick={onOpenQuickMatch}
              className="hidden lg:flex ml-1 px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap shrink-0 items-center gap-1 shadow-sm shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>จัดคู่ด่วน</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
