/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Mail, Lock, User, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { useBadminton } from '../context/BadmintonContext';
import { SkillLevel } from '../types/badminton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { loginWithGmail, loginWithPassword, registerUser } = useBadminton();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGmailPicker, setShowGmailPicker] = useState(false);
  const [customGmail, setCustomGmail] = useState('');

  if (!isOpen) return null;

  const handleGmailLogin = async (targetEmail: string, displayName?: string) => {
    setErrorMsg(null);
    try {
      await loginWithGmail(targetEmail, displayName);
      onClose();
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการลงชื่อเข้าใช้ด้วย Gmail');
    }
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg('กรุณากรอกอีเมล');
      return;
    }
    const res = loginWithPassword(email.trim(), password, rememberMe);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้งาน');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    const success = registerUser({
      name: name.trim(),
      nickname: nickname.trim() || name.trim().split(' ')[0],
      email: email.trim(),
      password,
      skillLevel,
      rememberMe,
    });

    if (success) {
      onClose();
    } else {
      setErrorMsg('อีเมลนี้เคยลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
            🏸
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'เข้าสู่ระบบ BadmintonHub' : 'ลงทะเบียนสมาชิกใหม่'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'บันทึกประวัติการแข่งขัน สถิติ และก๊วนโปรดของคุณ'
              : 'สร้างบัญชีเพื่อจดจำผู้ใช้และเชื่อมต่อกับนักกีฬาในสนาม'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'login'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            เข้าสู่ระบบ (Sign In)
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'register'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ลงทะเบียน (Register)
          </button>
        </div>

        {/* Google / Gmail Quick Sign-In Button */}
        <div className="space-y-3 mb-5">
          <button
            onClick={() => setShowGmailPicker(!showGmailPicker)}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-3 border border-slate-200"
          >
            {/* Real SVG Google Colorful Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>ลงชื่อเข้าใช้ด้วย Google / Gmail</span>
          </button>

          {/* Quick Gmail Accounts Popup / Selection */}
          {showGmailPicker && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 animate-fade-in">
              <div className="text-[11px] font-semibold text-slate-400">
                เลือกบัญชี Google หรือระบุ Gmail:
              </div>

              {/* Pre-suggested user account */}
              <button
                onClick={() => handleGmailLogin('able1272549@gmail.com', 'Able Badminton')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">able1272549@gmail.com</div>
                    <div className="text-[10px] text-slate-400">Able Badminton · ผู้ใช้งานระบบ</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  คลิกเข้าใช้
                </span>
              </button>

              {/* Custom Gmail Form */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
                <input
                  type="email"
                  placeholder="หรือกรอกชื่อ@gmail.com อื่นๆ"
                  value={customGmail}
                  onChange={(e) => setCustomGmail(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGmail.trim()) {
                      handleGmailLogin(customGmail.trim());
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg active:scale-95"
                >
                  เข้าใช้
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] text-slate-500">หรือใช้อีเมลและรหัสผ่าน</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form: Login Mode */}
        {mode === 'login' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="เช่น your-email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>จำฉันไว้ในระบบ (Remember Me)</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] mt-2"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        ) : (
          /* Form: Register Mode */
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                ชื่อ-นามสกุล หรือชื่อจริง *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="เช่น สมชาย รักแบด"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ชื่อเล่น (แสดงบนสนาม)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ชาย"
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
                  className="w-full px-2.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                อีเมล (Gmail หรืออีเมลอื่นๆ) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                กำหนดรหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  placeholder="อย่างน้อย 4 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>จดจำข้อมูลผู้ใช้งานบนอุปกรณ์นี้ (Remember Me)</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>สร้างบัญชีผู้ใช้</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
