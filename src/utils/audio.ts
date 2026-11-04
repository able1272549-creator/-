/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const THAI_NUMBERS: Record<number, string> = {
  0: 'ศูนย์',
  1: 'หนึ่ง',
  2: 'สอง',
  3: 'สาม',
  4: 'สี่',
  5: 'ห้า',
  6: 'หก',
  7: 'เจ็ด',
  8: 'แปด',
  9: 'เก้า',
  10: 'สิบ',
  11: 'สิบเอ็ด',
  12: 'สิบสอง',
  13: 'สิบสาม',
  14: 'สิบสี่',
  15: 'สิบห้า',
  16: 'สิบหก',
  17: 'สิบเจ็ด',
  18: 'สิบแปด',
  19: 'สิบเก้า',
  20: 'ยี่สิบ',
  21: 'ยี่สิบเอ็ด',
  22: 'ยี่สิบสอง',
  23: 'ยี่สิบสาม',
  24: 'ยี่สิบสี่',
  25: 'ยี่สิบห้า',
  26: 'ยี่สิบหก',
  27: 'ยี่สิบเจ็ด',
  28: 'ยี่สิบแปด',
  29: 'ยี่สิบเก้า',
  30: 'สามสิบ',
};

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Authentic shuttlecock "thwack" sound (noise burst + low resonance)
  public playHit() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }

  // Score point cheerful chime
  public playPoint() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.06); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore
    }
  }

  // Soft UI click sound
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // ignore
    }
  }

  // QR Code scan success chime
  public playScanSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(1046.5, now); // C6
      osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      osc2.frequency.setValueAtTime(2093, now + 0.08); // C7

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.28);
      osc2.stop(now + 0.28);
    } catch {
      // ignore
    }
  }

  // Referee Whistle
  public playWhistle() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(2600, ctx.currentTime);
      osc2.frequency.setValueAtTime(2850, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {
      // ignore
    }
  }

  // Match Point / Game Point alert
  public playAlert() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // ignore
    }
  }

  // Victory celebration fanfare
  public playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Voice Announcement for Badminton Score (Thai or English)
   * Follows standard BWF tournament referee conventions:
   * Server score first, followed by receiver score.
   */
  public announceScore(
    scoreA: number,
    scoreB: number,
    servingSide: 'A' | 'B' | 'teamA' | 'teamB',
    language: 'th' | 'en' = 'th',
    event?: 'point' | 'game_point' | 'match_point' | 'deuce' | 'game_won'
  ) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech immediately

      const isServerA = servingSide === 'A' || servingSide === 'teamA';
      const serverScore = isServerA ? scoreA : scoreB;
      const receiverScore = isServerA ? scoreB : scoreA;

      let phrase = '';

      if (language === 'th') {
        const serverThai = THAI_NUMBERS[serverScore] || `${serverScore}`;
        const receiverThai = THAI_NUMBERS[receiverScore] || `${receiverScore}`;

        if (event === 'game_won') {
          phrase = `เกม! ${serverThai} ต่อ ${receiverThai}`;
        } else if (event === 'match_point') {
          phrase = `แมตช์พอยต์! ${serverThai} - ${receiverThai}`;
        } else if (event === 'game_point') {
          phrase = `เกมพอยต์! ${serverThai} - ${receiverThai}`;
        } else if (event === 'deuce' || (serverScore >= 20 && serverScore === receiverScore)) {
          phrase = `ดิวส์! ${serverThai} เท่า`;
        } else if (serverScore === receiverScore) {
          phrase = `${serverThai} เท่า`;
        } else {
          phrase = `${serverThai} - ${receiverThai}`;
        }
      } else {
        // English (Standard BWF umpire phraseology)
        if (event === 'game_won') {
          phrase = `Game, ${serverScore} to ${receiverScore}`;
        } else if (event === 'match_point') {
          phrase = `Match point, ${serverScore} - ${receiverScore}`;
        } else if (event === 'game_point') {
          phrase = `Game point, ${serverScore} - ${receiverScore}`;
        } else if (event === 'deuce' || (serverScore >= 20 && serverScore === receiverScore)) {
          phrase = `20 all, Setting`;
        } else if (serverScore === 0 && receiverScore === 0) {
          phrase = `Love all, play`;
        } else if (serverScore === receiverScore) {
          phrase = `${serverScore} all`;
        } else {
          phrase = `${serverScore} - ${receiverScore}`;
        }
      }

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = language === 'th' ? 'th-TH' : 'en-US';
      utterance.rate = language === 'th' ? 1.05 : 1.0;
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langPrefix = language === 'th' ? 'th' : 'en';
        const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }
}

export const sounds = new SoundEffects();
