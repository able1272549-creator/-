/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  QrCode,
  Copy,
  Check,
  Share2,
  DollarSign,
  Receipt,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useBadminton } from '../context/BadmintonContext';
import { generatePromptPayPayload, generateQrDataUrl } from '../utils/promptpay';

export const ExpenseView: React.FC = () => {
  const { expenses, updateExpenses, players, togglePlayerPayment, sessionInfo } = useBadminton();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedPromptPay, setCopiedPromptPay] = useState(false);

  // Calculations
  const courtCost = expenses.courtHourlyRate * expenses.totalCourtHours;
  const shuttleCost = expenses.shuttlePricePerUnit * expenses.shuttlesUsed;
  const totalCost = courtCost + shuttleCost + (expenses.additionalFee || 0);

  const activePlayers = players.filter((p) => p.gamesPlayed > 0 || p.status !== 'resting');
  const playerCount = activePlayers.length || 1;

  // Equal split
  const costPerPersonEqual = Math.ceil(totalCost / playerCount);

  // Total games played by active players
  const totalGamesPlayed = activePlayers.reduce((acc, p) => acc + (p.gamesPlayed || 1), 0) || 1;

  // Calculate each player's share based on split method
  const getPlayerShare = (gamesPlayed: number): number => {
    if (expenses.splitMethod === 'equal') {
      return costPerPersonEqual;
    }
    // Per-game proportional split (with minimum 1 game weight)
    const effectiveGames = Math.max(1, gamesPlayed);
    const proportional = (effectiveGames / totalGamesPlayed) * totalCost;
    return Math.ceil(proportional);
  };

  // Generate PromptPay QR Code when settings change
  useEffect(() => {
    let isMounted = true;
    const generateQr = async () => {
      if (!expenses.promptPayId) {
        setQrDataUrl('');
        return;
      }
      try {
        const payload = generatePromptPayPayload(expenses.promptPayId, costPerPersonEqual);
        const dataUrl = await generateQrDataUrl(payload);
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Failed to generate PromptPay QR', err);
      }
    };

    generateQr();
    return () => {
      isMounted = false;
    };
  }, [expenses.promptPayId, costPerPersonEqual]);

  // Format LINE message summary
  const generateLineSummary = (): string => {
    let text = `🏸 สรุปยอดค่าก๊วนแบดมินตัน: ${sessionInfo.sessionName}\n`;
    text += `📅 วันที่: ${sessionInfo.date} @ ${sessionInfo.venueName}\n`;
    text += `--------------------------------\n`;
    text += `🏟️ ค่าสนาม: ${expenses.courtHourlyRate} ฿ × ${expenses.totalCourtHours} ชม. = ${courtCost} บาท\n`;
    text += `🏸 ค่าลูกแบด: ${expenses.shuttlesUsed} ลูก (${expenses.shuttleBrand}) = ${shuttleCost} บาท\n`;
    if (expenses.additionalFee > 0) {
      text += `🥤 อื่นๆ: ${expenses.additionalFee} บาท (${expenses.additionalFeeDescription || 'ทั่วไป'})\n`;
    }
    text += `💰 รวมทั้งสิ้น: ${totalCost} บาท\n`;
    text += `👥 ผู้เล่น: ${playerCount} คน (${expenses.splitMethod === 'equal' ? `หารเท่าคนละ ~${costPerPersonEqual} ฿` : 'หารตามเกมที่เล่น'})\n`;
    text += `--------------------------------\n`;
    text += `📋 รายการเก็บเงินรายคน:\n`;

    activePlayers.forEach((p, idx) => {
      const share = getPlayerShare(p.gamesPlayed);
      const paidStatus = p.hasPaid ? '✅ จ่ายแล้ว' : '⏳ รอโอน';
      text += `${idx + 1}. ${p.name} (${p.gamesPlayed} เกม) : ${share} บาท [${paidStatus}]\n`;
    });

    if (expenses.promptPayId) {
      text += `--------------------------------\n`;
      text += `📱 โอนพร้อมเพย์: ${expenses.promptPayId} (${expenses.promptPayName || 'หัวหน้าก๊วน'})\n`;
      text += `ยอดต่อคน: ${costPerPersonEqual} บาท\n`;
    }

    return text;
  };

  const handleCopySummary = async () => {
    const summary = generateLineSummary();
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyPromptPay = async () => {
    try {
      await navigator.clipboard.writeText(expenses.promptPayId);
      setCopiedPromptPay(true);
      setTimeout(() => setCopiedPromptPay(false), 2500);
    } catch {}
  };

  const totalPaidAmount = activePlayers
    .filter((p) => p.hasPaid)
    .reduce((acc, p) => acc + getPlayerShare(p.gamesPlayed), 0);

  const paidCount = activePlayers.filter((p) => p.hasPaid).length;

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">ยอดรวมทั้งหมด</span>
          <div className="text-2xl font-black text-white font-mono mt-1 tabular-nums">
            ฿{totalCost.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            ค่าสนาม ฿{courtCost} + ลูก ฿{shuttleCost}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">ยอดหารต่อคน</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1 tabular-nums">
            ฿{costPerPersonEqual}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            หารเฉลี่ย {playerCount} คน
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">สถานะเก็บเงิน</span>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1 tabular-nums">
            {paidCount}/{playerCount} คน
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            เก็บได้แล้ว ฿{totalPaidAmount.toLocaleString()} / ฿{totalCost.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">ส่งสรุปเข้ากลุ่ม LINE</span>
          <button
            onClick={handleCopySummary}
            className="w-full mt-2 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            {copiedSummary ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSummary ? 'คัดลอกเรียบร้อย!' : 'คัดลอกสรุปส่ง LINE'}</span>
          </button>
        </div>
      </div>

      {/* Main Form & Settlement Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Expense Settings Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>ตั้งค่าค่าใช้จ่ายก๊วน</span>
            </h3>

            {/* Court Hourly & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ค่าเช่าสนาม (บาท/ชม.)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={expenses.courtHourlyRate}
                  onChange={(e) => updateExpenses({ courtHourlyRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  จำนวนชั่วโมงที่ตี (ชม.)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={expenses.totalCourtHours}
                  onChange={(e) => updateExpenses({ totalCourtHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            {/* Shuttle Price & Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ราคาลูกแบด (บาท/ลูก)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={expenses.shuttlePricePerUnit}
                  onChange={(e) => updateExpenses({ shuttlePricePerUnit: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  จำนวนลูกแบดที่ใช้ไป (ลูก)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateExpenses({ shuttlesUsed: Math.max(0, expenses.shuttlesUsed - 1) })}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={expenses.shuttlesUsed}
                    onChange={(e) => updateExpenses({ shuttlesUsed: Math.max(0, Number(e.target.value)) })}
                    className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-center"
                  />
                  <button
                    onClick={() => updateExpenses({ shuttlesUsed: expenses.shuttlesUsed + 1 })}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Shuttle Brand & Other Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ยี่ห้อ / รุ่นลูกแบด
                </label>
                <input
                  type="text"
                  placeholder="เช่น RSL Silver Speed 76"
                  value={expenses.shuttleBrand}
                  onChange={(e) => updateExpenses({ shuttleBrand: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ค่าใช้จ่ายเพิ่มเติม (บาท เช่น ค่าน้ำ)
                </label>
                <input
                  type="number"
                  min="0"
                  value={expenses.additionalFee}
                  onChange={(e) => updateExpenses({ additionalFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            {/* Split Method Toggle */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                รูปแบบการหารเงิน
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => updateExpenses({ splitMethod: 'equal' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg transition-colors ${
                    expenses.splitMethod === 'equal'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  หารเท่ากันทุกคน ({costPerPersonEqual} ฿/คน)
                </button>
                <button
                  onClick={() => updateExpenses({ splitMethod: 'per_game' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg transition-colors ${
                    expenses.splitMethod === 'per_game'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  หารตามจำนวนเกมที่เล่น
                </button>
              </div>
            </div>
          </div>

          {/* Per-player payment checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>ตารางชำระเงินรายคน ({activePlayers.length} คน)</span>
              </h3>
              <span className="text-xs text-slate-400">แตะเพื่อสลับสถานะจ่ายเงิน</span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {activePlayers.map((player) => {
                const share = getPlayerShare(player.gamesPlayed);
                return (
                  <div
                    key={player.id}
                    onClick={() => togglePlayerPayment(player.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      player.hasPaid
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: player.avatarColor }}
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{player.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            (เล่น {player.gamesPlayed} เกม)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-white tabular-nums">
                        ฿{share}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          player.hasPaid
                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                            : 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                        }`}
                      >
                        {player.hasPaid ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>จ่ายแล้ว</span>
                          </>
                        ) : (
                          <span>รอชำระ</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: PromptPay QR Code & LINE Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* PromptPay Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>สแกนจ่ายผ่านพร้อมเพย์ (PromptPay)</span>
            </h3>

            {/* PromptPay Settings Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  เบอร์โทรศัพท์ หรือ เลขบัตร ปชช. ผู้รับเงิน
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="เช่น 0812345678"
                    value={expenses.promptPayId}
                    onChange={(e) => updateExpenses({ promptPayId: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                  <button
                    onClick={handleCopyPromptPay}
                    title="คัดลอกเบอร์พร้อมเพย์"
                    className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-xs flex items-center gap-1"
                  >
                    {copiedPromptPay ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ชื่อบัญชีผู้รับเงิน (แสดงในข้อความสรุป)
                </label>
                <input
                  type="text"
                  placeholder="เช่น สมชาย รักแบด"
                  value={expenses.promptPayName}
                  onChange={(e) => updateExpenses({ promptPayName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            {/* Generated QR Code Image */}
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-slate-900 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-2">
                <span>พร้อมเพย์ (PROMPTPAY)</span>
              </div>

              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="PromptPay QR Code"
                  className="w-48 h-48 rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                  กรุณากรอกเบอร์พร้อมเพย์
                </div>
              )}

              <div className="text-center mt-2">
                <div className="text-xs text-slate-600 font-medium">
                  {expenses.promptPayName || 'พร้อมเพย์'}
                </div>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                  ฿{costPerPersonEqual.toLocaleString()} / คน
                </div>
              </div>
            </div>
          </div>

          {/* LINE Group Preview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">ตัวอย่างข้อความส่งไลน์</span>
              <button
                onClick={handleCopySummary}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                {copiedSummary ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSummary ? 'คัดลอกแล้ว' : 'คัดลอกทั้งหมด'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-48 leading-relaxed border border-slate-800">
              {generateLineSummary()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
