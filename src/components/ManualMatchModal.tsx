/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Users, UserPlus } from 'lucide-react';
import { useBadminton } from '../context/BadmintonContext';
import { Player, MatchType } from '../types/badminton';

interface ManualMatchModalProps {
  courtId: string;
  courtName: string;
  onClose: () => void;
}

export const ManualMatchModal: React.FC<ManualMatchModalProps> = ({ courtId, courtName, onClose }) => {
  const { players, startMatchOnCourt } = useBadminton();
  const [matchType, setMatchType] = useState<MatchType>('doubles');
  const [selectedTeamA, setSelectedTeamA] = useState<string[]>([]);
  const [selectedTeamB, setSelectedTeamB] = useState<string[]>([]);

  // Eligible players: not currently playing on another court
  const availablePlayers = players.filter((p) => p.status !== 'playing');

  const requiredPerTeam = matchType === 'doubles' ? 2 : 1;

  const handleTogglePlayer = (playerId: string, team: 'A' | 'B') => {
    if (team === 'A') {
      if (selectedTeamA.includes(playerId)) {
        setSelectedTeamA((prev) => prev.filter((id) => id !== playerId));
      } else {
        if (selectedTeamB.includes(playerId)) {
          setSelectedTeamB((prev) => prev.filter((id) => id !== playerId));
        }
        if (selectedTeamA.length < requiredPerTeam) {
          setSelectedTeamA((prev) => [...prev, playerId]);
        }
      }
    } else {
      if (selectedTeamB.includes(playerId)) {
        setSelectedTeamB((prev) => prev.filter((id) => id !== playerId));
      } else {
        if (selectedTeamA.includes(playerId)) {
          setSelectedTeamA((prev) => prev.filter((id) => id !== playerId));
        }
        if (selectedTeamB.length < requiredPerTeam) {
          setSelectedTeamB((prev) => [...prev, playerId]);
        }
      }
    }
  };

  const handleStart = () => {
    if (selectedTeamA.length !== requiredPerTeam || selectedTeamB.length !== requiredPerTeam) {
      return;
    }

    const teamAPlayers = players.filter((p) => selectedTeamA.includes(p.id));
    const teamBPlayers = players.filter((p) => selectedTeamB.includes(p.id));

    startMatchOnCourt(courtId, teamAPlayers, teamBPlayers, matchType);
    onClose();
  };

  const isReadyToStart =
    selectedTeamA.length === requiredPerTeam && selectedTeamB.length === requiredPerTeam;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>เลือกผู้เล่นลง {courtName}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">จัดคู่และทีมด้วยตัวเองอย่างอิสระ</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Type Selector */}
        <div className="my-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            ประเภทการแข่งขัน
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <button
              onClick={() => {
                setMatchType('doubles');
                setSelectedTeamA([]);
                setSelectedTeamB([]);
              }}
              className={`py-2 px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                matchType === 'doubles'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ประเภทคู่ (Doubles 2v2)
            </button>
            <button
              onClick={() => {
                setMatchType('singles');
                setSelectedTeamA([]);
                setSelectedTeamB([]);
              }}
              className={`py-2 px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                matchType === 'singles'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ประเภทเดี่ยว (Singles 1v1)
            </button>
          </div>
        </div>

        {/* Selected Teams Visual */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Team A */}
          <div className="bg-slate-950/50 rounded-xl p-3 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400">
                ทีม A ({selectedTeamA.length}/{requiredPerTeam})
              </span>
              <span className="text-[11px] text-slate-500">ฝั่งซ้าย</span>
            </div>
            <div className="space-y-1.5 min-h-[64px]">
              {selectedTeamA.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-3 italic">เลือกผู้เล่นเข้าทีม A</div>
              ) : (
                selectedTeamA.map((id) => {
                  const p = players.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <div
                      key={id}
                      onClick={() => handleTogglePlayer(id, 'A')}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs cursor-pointer hover:border-rose-500/50 group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: p.avatarColor }}
                        />
                        <span className="font-medium text-slate-200">{p.name}</span>
                      </div>
                      <X className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Team B */}
          <div className="bg-slate-950/50 rounded-xl p-3 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-400">
                ทีม B ({selectedTeamB.length}/{requiredPerTeam})
              </span>
              <span className="text-[11px] text-slate-500">ฝั่งขวา</span>
            </div>
            <div className="space-y-1.5 min-h-[64px]">
              {selectedTeamB.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-3 italic">เลือกผู้เล่นเข้าทีม B</div>
              ) : (
                selectedTeamB.map((id) => {
                  const p = players.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <div
                      key={id}
                      onClick={() => handleTogglePlayer(id, 'B')}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs cursor-pointer hover:border-rose-500/50 group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: p.avatarColor }}
                        />
                        <span className="font-medium text-slate-200">{p.name}</span>
                      </div>
                      <X className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Player Roster for selection */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            แตะเลือกผู้เล่นเข้าทีม (คลิกที่ปุ่ม A หรือ B)
          </label>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {availablePlayers.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">ไม่มีผู้เล่นว่างในขณะนี้</div>
            ) : (
              availablePlayers.map((player) => {
                const inA = selectedTeamA.includes(player.id);
                const inB = selectedTeamB.includes(player.id);
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: player.avatarColor }}
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{player.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {player.skillLevel} · เล่นแล้ว {player.gamesPlayed} เกม
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePlayer(player.id, 'A')}
                        disabled={!inA && selectedTeamA.length >= requiredPerTeam}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                          inA
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30'
                        }`}
                      >
                        {inA ? '✓ ในทีม A' : '+ ทีม A'}
                      </button>
                      <button
                        onClick={() => handleTogglePlayer(player.id, 'B')}
                        disabled={!inB && selectedTeamB.length >= requiredPerTeam}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                          inB
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30'
                        }`}
                      >
                        {inB ? '✓ ในทีม B' : '+ ทีม B'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleStart}
            disabled={!isReadyToStart}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-98 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>เริ่มแมตช์ลงสนาม</span>
          </button>
        </div>
      </div>
    </div>
  );
};
