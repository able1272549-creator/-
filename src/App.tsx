/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BadmintonProvider, useBadminton } from './context/BadmintonContext';
import { Navbar, NavTab } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CourtManager } from './components/CourtManager';
import { ScoreboardView } from './components/ScoreboardView';
import { PlayerManager } from './components/PlayerManager';
import { ExpenseView } from './components/ExpenseView';
import { MatchHistoryView } from './components/MatchHistoryView';
import { ManualMatchModal } from './components/ManualMatchModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { JoinSessionModal } from './components/JoinSessionModal';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('courts');
  const [isQuickMatchModalOpen, setIsQuickMatchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinModalTab, setJoinModalTab] = useState<'join' | 'scan' | 'share'>('join');
  const [joinUrlCode, setJoinUrlCode] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Auto-open Join modal if ?join= query param is in URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('join');
      if (code) {
        setJoinUrlCode(code.toUpperCase());
        setJoinModalTab('join');
        setIsJoinModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const { courts, setActiveCourtIdForScoreboard, resetSession, currentUser } = useBadminton();

  const handleOpenScoreboardForCourt = (courtId: string) => {
    setActiveCourtIdForScoreboard(courtId);
    setCurrentTab('scoreboard');
  };

  const handleOpenQuickMatch = () => {
    const freeCourt = courts.find((c) => !c.isOccupied) || courts[0];
    if (freeCourt) {
      setIsQuickMatchModalOpen(true);
    }
  };

  const targetCourtForQuickModal = courts.find((c) => !c.isOccupied) || courts[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-slate-950">
      {/* 3-Zone Desktop Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickMatch={handleOpenQuickMatch}
        onOpenAuthModal={() => {
          setAuthMode('login');
          setIsAuthModalOpen(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenJoinModal={(tab) => {
          setJoinModalTab(tab || 'join');
          setIsJoinModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-5">
        {/* Welcome strip if not signed in */}
        {!currentUser && (
          <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                🏸
              </span>
              <div>
                <span className="font-bold text-white">ยินดีต้อนรับสู่ BadmintonHub!</span>
                <span className="text-slate-400 ml-1.5 hidden sm:inline">
                  ลงชื่อเข้าใช้ด้วย Gmail เพื่อจดจำสถิติและประวัติการเล่นของคุณ
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
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
                <span>ล็อกอินด้วย Gmail</span>
              </button>
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-95"
              >
                <span>+ ขอร่วมเล่น</span>
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1.5 text-slate-300 hover:text-white transition-colors"
              >
                ลงทะเบียน
              </button>
            </div>
          </div>
        )}

        {currentTab === 'courts' && (
          <CourtManager
            onNavigateToTab={setCurrentTab}
            onOpenScoreboardForCourt={handleOpenScoreboardForCourt}
          />
        )}
        {currentTab === 'scoreboard' && <ScoreboardView />}
        {currentTab === 'players' && <PlayerManager />}
        {currentTab === 'expenses' && <ExpenseView />}
        {currentTab === 'history' && <MatchHistoryView />}
      </main>

      {/* Ergonomic Mobile Bottom Nav Bar */}
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">BadmintonHub</span>
            <span aria-hidden="true">·</span>
            <span>ระบบจัดก๊วนแบด สกอร์บอร์ด &amp; คิดเงิน</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.confirm('คุณต้องการรีเซ็ตข้อมูลและเริ่มก๊วนใหม่หรือไม่?')) {
                  resetSession();
                }
              }}
              className="text-rose-400 hover:text-rose-300 transition-colors"
            >
              รีเซ็ตก๊วนใหม่
            </button>
            <span aria-hidden="true">·</span>
            <span>กติกาการแข่งขัน BWF 21 แต้ม</span>
          </div>
        </div>
      </footer>

      {/* Quick Match Modal */}
      {isQuickMatchModalOpen && targetCourtForQuickModal && (
        <ManualMatchModal
          courtId={targetCourtForQuickModal.id}
          courtName={targetCourtForQuickModal.name}
          onClose={() => setIsQuickMatchModalOpen(false)}
        />
      )}

      {/* Auth Modal (Login & Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Global Join Session & Court Modal */}
      <JoinSessionModal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          setJoinUrlCode(null);
        }}
        defaultTab={joinModalTab}
        initialInviteCode={joinUrlCode || undefined}
      />
    </div>
  );
}

export default function App() {
  return (
    <BadmintonProvider>
      <MainApp />
    </BadmintonProvider>
  );
}
