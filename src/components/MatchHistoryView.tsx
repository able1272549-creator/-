/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History, Trophy, Clock, Download, Trash2, Calendar } from 'lucide-react';
import { useBadminton } from '../context/BadmintonContext';

export const MatchHistoryView: React.FC = () => {
  const { matchHistory, resetSession } = useBadminton();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} นาที ${secs} วินาที`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(matchHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `badminton_matches_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>ประวัติการแข่งขันทั้งหมด ({matchHistory.length} แมตช์)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            เก็บบันทึกผลการแข่งขัน คะแนน และระยะเวลาของทุกเกมในก๊วนนี้
          </p>
        </div>

        {matchHistory.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดข้อมูล JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* History Timeline */}
      {matchHistory.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300 mb-1">ยังไม่มีประวัติการแข่งขัน</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            เมื่อแข่งขันจบในคอร์ทและกดปุ่ม "บันทึกจบเกม" ผลคะแนนและสถิติจะถูกบันทึกมาแสดงที่นี่โดยอัตโนมัติ
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matchHistory.map((item, index) => {
            const isWinnerA = item.winner === 'teamA';
            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 md:p-5 transition-all shadow-sm"
              >
                {/* Header: Court & Time */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800 mb-3 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">แมตช์ #{matchHistory.length - index}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-300">{item.courtName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.matchType === 'doubles' ? 'ประเภทคู่' : 'ประเภทเดี่ยว'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatDuration(item.durationSeconds)}</span>
                    </div>
                    <span>{formatTime(item.finishedAt)}</span>
                  </div>
                </div>

                {/* Match Score Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Team A */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isWinnerA
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/30 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {isWinnerA && <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />}
                        <span className="font-bold text-white text-sm">
                          {item.teamANames.join(' & ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">ทีม A</span>
                    </div>

                    <div className="text-3xl font-black font-mono tabular-nums text-white">
                      {item.scoreA}
                    </div>
                  </div>

                  {/* Team B */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      !isWinnerA
                        ? 'bg-blue-950/20 border-blue-500/40 text-blue-300'
                        : 'bg-slate-950/30 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {!isWinnerA && <Trophy className="w-4 h-4 text-blue-400 shrink-0" />}
                        <span className="font-bold text-white text-sm">
                          {item.teamBNames.join(' & ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">ทีม B</span>
                    </div>

                    <div className="text-3xl font-black font-mono tabular-nums text-white">
                      {item.scoreB}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
