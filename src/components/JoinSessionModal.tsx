/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {
  X,
  Users,
  Share2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ShieldCheck,
  RotateCw,
  UserCheck,
  Zap,
  Camera,
  CameraOff,
  SwitchCamera,
  Image as ImageIcon,
  Download,
  AlertCircle,
  ExternalLink,
  Flashlight,
  FlashlightOff,
} from 'lucide-react';
import { useBadminton } from '../context/BadmintonContext';
import { SkillLevel, Gender } from '../types/badminton';
import { sounds } from '../utils/audio';

export type JoinModalTab = 'join' | 'scan' | 'share';

interface JoinSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourtId?: string;
  preselectedTeam?: 'teamA' | 'teamB';
  defaultTab?: JoinModalTab;
  initialInviteCode?: string;
}

export const JoinSessionModal: React.FC<JoinSessionModalProps> = ({
  isOpen,
  onClose,
  preselectedCourtId,
  preselectedTeam,
  defaultTab = 'join',
  initialInviteCode,
}) => {
  const {
    sessionInfo,
    courts,
    players,
    currentUser,
    joinSessionAsPlayer,
    regenerateInviteCode,
  } = useBadminton();

  const inviteCode = sessionInfo?.inviteCode || 'BADM-8899';

  const [activeTab, setActiveTab] = useState<JoinModalTab>(defaultTab);
  const [playerName, setPlayerName] = useState('');
  const [playerNickname, setPlayerNickname] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [gender, setGender] = useState<Gender>('unspecified');
  const [selectedCourtId, setSelectedCourtId] = useState<string>(preselectedCourtId || 'bench');
  const [selectedTeam, setSelectedTeam] = useState<'teamA' | 'teamB' | 'any'>(preselectedTeam || 'any');
  const [enteredInviteCode, setEnteredInviteCode] = useState(initialInviteCode || inviteCode);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedNotice, setScannedNotice] = useState<string | null>(null);

  // Real QR Code generation state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrGenerating, setQrGenerating] = useState<boolean>(false);

  // Camera scanner state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const lastScanTimeRef = useRef<number>(0);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchAvailable, setTorchAvailable] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);

  // Share URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?join=${encodeURIComponent(inviteCode)}`
    : '';

  // Generate genuine high-res scannable QR Code
  useEffect(() => {
    if (shareUrl) {
      setQrGenerating(true);
      QRCode.toDataURL(shareUrl, {
        width: 380,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then((url) => {
          setQrDataUrl(url);
          setQrGenerating(false);
        })
        .catch((err) => {
          console.error('QR code generation failed:', err);
          setQrGenerating(false);
        });
    }
  }, [shareUrl, inviteCode]);

  // Sync state if preselected court changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      if (preselectedCourtId) {
        setSelectedCourtId(preselectedCourtId);
      }
      if (preselectedTeam) {
        setSelectedTeam(preselectedTeam);
      }
      if (initialInviteCode) {
        setEnteredInviteCode(initialInviteCode);
        setScannedNotice(`ตรวจพบรหัสเข้าก๊วน "${initialInviteCode}" จากลิงก์สแกน`);
      } else {
        setEnteredInviteCode(inviteCode);
      }
      setSuccessMessage(null);
      setErrorMessage(null);

      // If user is logged in, prefill name and nickname
      if (currentUser) {
        setPlayerName(currentUser.name);
        setPlayerNickname(currentUser.nickname || currentUser.name.split(' ')[0]);
        setSkillLevel(currentUser.skillLevel);
      }
    }
  }, [isOpen, preselectedCourtId, preselectedTeam, inviteCode, initialInviteCode, currentUser, defaultTab]);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
    setTorchOn(false);
    setTorchAvailable(false);
  }, []);

  // Parse invite code from scanned raw text or URL
  const extractInviteCode = (rawText: string): string => {
    try {
      if (rawText.includes('join=')) {
        const url = new URL(rawText.startsWith('http') ? rawText : `https://${rawText}`);
        const codeParam = url.searchParams.get('join');
        if (codeParam) return codeParam.trim().toUpperCase();
      }
    } catch {
      // not a full url
    }

    const match = rawText.match(/BADM-[A-Za-z0-9]+/i);
    if (match) {
      return match[0].toUpperCase();
    }

    return rawText.trim().toUpperCase();
  };

  // Handle successful QR detection
  const handleScannedCode = useCallback(
    (detectedText: string) => {
      const code = extractInviteCode(detectedText);
      if (!code) return;

      // Play success chime and trigger haptic feedback if available
      sounds.playScanSuccess();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {}
      }

      stopCamera();
      setEnteredInviteCode(code);
      setScannedNotice(`🎉 สแกน QR Code สำเร็จ! รหัสเข้าก๊วน: ${code}`);
      setErrorMessage(null);
      setActiveTab('join');
    },
    [stopCamera]
  );

  // High-performance QR scan loop (BarcodeDetector + jsQR fallback)
  const scanLoop = useCallback(async () => {
    if (!isScanningRef.current) return;

    const now = performance.now();
    // Scan every ~75ms for high response rate with smooth video framerate
    if (now - lastScanTimeRef.current >= 75) {
      lastScanTimeRef.current = now;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        let detectedRawText: string | null = null;

        // 1. Try hardware-accelerated BarcodeDetector (Chrome Android, iOS 17+, desktop Chrome)
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            // @ts-expect-error native BarcodeDetector API
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await detector.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              detectedRawText = barcodes[0].rawValue;
            }
          } catch {
            // BarcodeDetector failed, fallback to jsQR below
          }
        }

        // 2. Fallback to jsQR with downscaled canvas
        if (!detectedRawText && canvas) {
          try {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              const maxDim = 640;
              let w = video.videoWidth;
              let h = video.videoHeight;
              if (w > maxDim || h > maxDim) {
                const ratio = Math.min(maxDim / w, maxDim / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
              }

              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(video, 0, 0, w, h);

              const imageData = ctx.getImageData(0, 0, w, h);
              const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth',
              });

              if (qrResult && qrResult.data) {
                detectedRawText = qrResult.data;
              }
            }
          } catch (e) {
            console.warn('Canvas jsQR error:', e);
          }
        }

        if (detectedRawText) {
          isScanningRef.current = false;
          handleScannedCode(detectedRawText);
          return;
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(scanLoop);
    }
  }, [handleScannedCode]);

  // Start camera stream with multi-level fallback
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsStartingCamera(true);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับการเปิดกล้อง');
      }

      // Try multiple constraint profiles for max compatibility
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!stream) {
        throw new Error('ไม่สามารถเข้าถึงสัญญาณภาพจากกล้องได้');
      }

      streamRef.current = stream;

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        try {
          const capabilities = track.getCapabilities() as unknown as { torch?: boolean };
          setTorchAvailable(!!capabilities?.torch);
        } catch {}
      }

      // Ensure video element exists in DOM (wait a frame if needed)
      let video = videoRef.current;
      if (!video) {
        await new Promise((resolve) => setTimeout(resolve, 60));
        video = videoRef.current;
      }

      if (!video) {
        throw new Error('ไม่พบหน้าต่างแสดงผลกล้องในระบบ');
      }

      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.muted = true;

      // Wait for metadata loaded
      await new Promise<void>((resolve) => {
        if (video!.readyState >= 1) {
          resolve();
        } else {
          const onLoaded = () => {
            video!.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          video!.addEventListener('loadedmetadata', onLoaded);
          setTimeout(resolve, 800);
        }
      });

      try {
        await video.play();
      } catch (playErr) {
        console.warn('Video play caught:', playErr);
      }

      setIsCameraActive(true);
      setIsStartingCamera(false);
      isScanningRef.current = true;
      lastScanTimeRef.current = 0;
      animationFrameIdRef.current = requestAnimationFrame(scanLoop);
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      const isNotAllowed =
        err instanceof Error &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      const msg = isNotAllowed
        ? 'กรุณาแตะอนุญาต (Allow) การเข้าถึงกล้องในเบราว์เซอร์ เพื่อสแกน QR Code'
        : 'ไม่สามารถเปิดกล้องได้ คุณสามารถเลือกรูป QR จากอัลบั้ม หรือกดปุ่มทดสอบสแกนด้านล่างได้ทันที';
      setCameraError(msg);
      setIsCameraActive(false);
      setIsStartingCamera(false);
    }
  }, [facingMode, scanLoop, stopCamera]);

  // Manage camera on tab change
  useEffect(() => {
    if (isOpen && activeTab === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, startCamera, stopCamera]);

  // Toggle Torch/Flash
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchOn;
      // @ts-expect-error torch constraint
      await track.applyConstraints({ advanced: [{ torch: nextTorch }] });
      setTorchOn(nextTorch);
    } catch {
      // torch not supported on this track
    }
  };

  // Flip Camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Scan from photo upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        let detectedText: string | null = null;

        // 1. Try BarcodeDetector
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            // @ts-expect-error native BarcodeDetector API
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await detector.detect(img);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              detectedText = barcodes[0].rawValue;
            }
          } catch {}
        }

        // 2. Fallback to jsQR
        if (!detectedText) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (result && result.data) {
              detectedText = result.data;
            }
          }
        }

        if (detectedText) {
          handleScannedCode(detectedText);
        } else {
          setErrorMessage('ไม่พบ QR Code ในรูปภาพที่เลือก กรุณาใช้รูปที่เห็น QR Code ชัดเจน');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate invite code if entered
    const cleanEntered = (enteredInviteCode || '').trim().toUpperCase();
    const currentCode = inviteCode.toUpperCase();
    if (cleanEntered && cleanEntered !== currentCode) {
      setErrorMessage('รหัสเข้าก๊วนไม่ถูกต้อง กรุณาตรวจสอบรหัสจากหัวหน้าก๊วน หรือสแกน QR Code');
      return;
    }

    if (!playerName.trim()) {
      setErrorMessage('กรุณาระบุชื่อของคุณ');
      return;
    }

    // Check if player already exists in session
    const existingPlayer = players.find(
      (p) => p.name.toLowerCase() === playerName.trim().toLowerCase()
    );

    if (existingPlayer) {
      setErrorMessage(`มีผู้เล่นชื่อ "${playerName.trim()}" ในก๊วนแล้ว สามารถเปลี่ยนชื่อหรือต่อท้ายเลขได้`);
      return;
    }

    const res = joinSessionAsPlayer({
      name: playerName.trim(),
      nickname: playerNickname.trim() || undefined,
      skillLevel,
      gender,
      preferredCourtId: selectedCourtId !== 'bench' ? selectedCourtId : undefined,
      preferredTeam: selectedTeam !== 'any' ? selectedTeam : undefined,
    });

    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative my-8">
        {/* Hidden offscreen canvas for QR scanning */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors z-10"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-10">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl shrink-0">
            🏸
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>
                {activeTab === 'join'
                  ? 'ขอเข้าร่วมเล่นในคอร์ท'
                  : activeTab === 'scan'
                  ? 'กล้องสแกน QR เข้าก๊วน'
                  : 'แชร์ QR & รหัสชวนเพื่อน'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 truncate max-w-xs">
              {sessionInfo?.sessionName || 'ก๊วนแบดมินตัน'} ({sessionInfo?.venueName || 'สนามแบดมินตัน'})
            </p>
          </div>
        </div>

        {/* 3 Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'join'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ลงชื่อเข้าเล่น</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'scan'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>สแกน QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'share'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>แชร์ QR ก๊วน</span>
          </button>
        </div>

        {/* =========================================================================
            Tab 1: Join Form
           ========================================================================= */}
        {activeTab === 'join' && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            {/* Scanned Notice Banner */}
            {scannedNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="font-semibold">{scannedNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setScannedNotice(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-bounce-subtle">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Account Recognition Banner if Logged In */}
            {currentUser && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-300">ใช้บัญชี: </span>
                    <span className="font-bold text-white">{currentUser.name}</span>
                    <span className="text-slate-400 ml-1">({currentUser.nickname})</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  ล็อกอินแล้ว
                </span>
              </div>
            )}

            {/* Invite Code Check & Quick Scan Link */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>รหัสเข้าก๊วน (Invite Code)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('scan')}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Camera className="w-3 h-3" />
                    <span>เปิดกล้องสแกน</span>
                  </button>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    ก๊วน: {inviteCode}
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={enteredInviteCode}
                  onChange={(e) => setEnteredInviteCode(e.target.value.toUpperCase())}
                  placeholder="เช่น BADM-8899"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase text-sm tracking-wider focus:outline-none focus:border-emerald-500"
                />
                {(enteredInviteCode || '').trim().toUpperCase() === inviteCode.toUpperCase() ? (
                  <span className="absolute right-3 top-3 text-emerald-400 flex items-center gap-1 text-[11px] font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ถูกต้อง</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEnteredInviteCode(inviteCode)}
                    className="absolute right-2.5 top-2.5 px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    ใช้รหัสปัจจุบัน
                  </button>
                )}
              </div>
            </div>

            {/* Player Name and Nickname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อผู้เล่น <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="เช่น กฤต หรือ Somchai"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อเล่น (สำหรับขานแต้ม)
                </label>
                <input
                  type="text"
                  value={playerNickname}
                  onChange={(e) => setPlayerNickname(e.target.value)}
                  placeholder="เช่น บิ๊ก, นัท"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Skill Level Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ระดับฝีมือ (Skill Level)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'beginner', label: 'มือใหม่', sub: 'เพิ่งเริ่มเล่น' },
                  { id: 'intermediate', label: 'มือกลาง', sub: 'ตีประจำ/เล่นเกมส์ได้' },
                  { id: 'advanced', label: 'มือโปร', sub: 'แข่งขัน/ทักษะสูง' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSkillLevel(item.id as SkillLevel)}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      skillLevel === item.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                เพศ (สำหรับการจัดคู่ผสม)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'male', label: 'ชาย 👨' },
                  { id: 'female', label: 'หญิง 👩' },
                  { id: 'unspecified', label: 'ไม่ระบุ' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGender(g.id as Gender)}
                    className={`py-1.5 px-2 rounded-xl text-xs border transition-all ${
                      gender === g.id
                        ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Court / Slot Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                เลือกตำแหน่งที่ต้องการเข้าร่วม
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {/* Option: Waiting Bench */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourtId('bench');
                    setSelectedTeam('any');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedCourtId === 'bench'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs">
                      🪑
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white">ม้านั่งรอคิว (Waiting Bench)</div>
                      <div className="text-[10px] text-slate-400">
                        พร้อมเล่น ให้ระบบจัดคิวลงสนามอัตโนมัติ
                      </div>
                    </div>
                  </div>
                  {selectedCourtId === 'bench' && (
                    <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                      เลือกแล้ว
                    </span>
                  )}
                </button>

                {/* Option per active court */}
                {courts.map((court) => {
                  const maxPerTeam = court.matchType === 'singles' ? 1 : 2;
                  const freeA = Math.max(0, maxPerTeam - court.teamA.length);
                  const freeB = Math.max(0, maxPerTeam - court.teamB.length);
                  const hasVacancy = freeA > 0 || freeB > 0;
                  const isSelected = selectedCourtId === court.id;

                  return (
                    <div
                      key={court.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCourtId(court.id)}
                        className="w-full text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                            {court.number}
                          </span>
                          <div>
                            <div className="text-xs font-semibold text-white">{court.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {court.matchType === 'singles' ? 'เดี่ยว' : 'คู่'} ·{' '}
                              {hasVacancy ? (
                                <span className="text-emerald-400 font-medium">มีที่ว่าง</span>
                              ) : (
                                <span className="text-rose-400">เต็มแล้ว (แข่งขันอยู่)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                            เลือกคอร์ทนี้
                          </span>
                        )}
                      </button>

                      {/* If this court is selected, let user pick team slot */}
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-slate-800/60 grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTeam('teamA')}
                            className={`py-1 px-2 rounded-lg text-xs border ${
                              selectedTeam === 'teamA'
                                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            ทีม A ({freeA > 0 ? `ว่าง ${freeA}` : 'เต็ม'})
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedTeam('teamB')}
                            className={`py-1 px-2 rounded-lg text-xs border ${
                              selectedTeam === 'teamB'
                                ? 'bg-blue-500 text-white font-bold border-blue-400'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            ทีม B ({freeB > 0 ? `ว่าง ${freeB}` : 'เต็ม'})
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedTeam('any')}
                            className={`py-1 px-2 rounded-lg text-xs border ${
                              selectedTeam === 'any'
                                ? 'bg-slate-700 text-white font-semibold border-slate-500'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            ทีมใดก็ได้
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-98 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>ยืนยันเข้าร่วมก๊วนทันที</span>
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            Tab 2: Camera QR Scanner
           ========================================================================= */}
        {activeTab === 'scan' && (
          <div className="space-y-4 animate-fade-in text-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                สแกน QR Code เข้าก๊วน
              </span>
              <p className="text-xs text-slate-300">
                ส่องกล้องไปที่ QR Code ของก๊วนบนหน้าจอเพื่อน เพื่อเข้าก๊วนและเริ่มเล่นอัตโนมัติ
              </p>
            </div>

            {/* Camera Viewport */}
            <div className="relative mx-auto w-full max-w-xs aspect-square bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
              {/* Video Element is ALWAYS mounted so videoRef is never null */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isCameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                playsInline
                muted
                autoPlay
              />

              {/* Viewfinder Overlay when Camera is Active */}
              {isCameraActive && (
                <>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Targeting frame */}
                    <div className="relative w-48 h-48 border-2 border-emerald-400/80 rounded-2xl shadow-lg">
                      {/* 4 Corner highlights */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                      {/* Animated scanning laser line */}
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-laser" />
                    </div>
                  </div>

                  {/* Camera Control Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    {torchAvailable && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                          torchOn ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900/80 text-white'
                        }`}
                        title="เปิด/ปิด แฟลช"
                      >
                        {torchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={flipCamera}
                      className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-800 transition-colors active:scale-95"
                      title="สลับกล้องหน้า/หลัง"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-slate-950/85 text-emerald-400 font-mono text-[11px] backdrop-blur-sm border border-emerald-500/30 shadow-md">
                      กำลังสแกนหา QR Code...
                    </span>
                  </div>
                </>
              )}

              {/* Overlay when Camera is NOT active (Loading / Error / Permissions) */}
              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/95 z-20">
                  {isStartingCamera ? (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                        <Camera className="w-6 h-6 animate-spin" />
                      </div>
                      <div className="text-xs text-slate-200 font-semibold">
                        กำลังเชื่อมต่อกล้อง...
                      </div>
                      <div className="text-[11px] text-slate-400">
                        กรุณากด 'อนุญาต' (Allow) หากเบราว์เซอร์ขอสิทธิ์ใช้งานกล้อง
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <CameraOff className="w-6 h-6" />
                      </div>
                      <div className="text-xs text-rose-300 font-medium px-2">
                        {cameraError || 'ยังไม่ได้เปิดกล้อง หรือรอการอนุญาต'}
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
                      >
                        ลองเปิดกล้องใหม่อีกครั้ง
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Fallback Options: Upload Image & 1-Click Demo Test */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700 active:scale-95"
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>เลือกรูป QR จากแกลเลอรี / แคปหน้าจอ</span>
              </button>
              <button
                type="button"
                onClick={() => handleScannedCode(shareUrl || `https://badmintonhub.app/?join=${inviteCode}`)}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/30 active:scale-95"
                title="ทดสอบระบบเสมือนสแกน QR Code สำเร็จทันที"
              >
                <Sparkles className="w-4 h-4" />
                <span>ทดสอบสแกนก๊วนนี้ ({inviteCode})</span>
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('join')}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
              >
                หรือพิมพ์รหัสเข้าก๊วนด้วยตนเอง
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            Tab 3: Share QR & Invite Link
           ========================================================================= */}
        {activeTab === 'share' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                ชวนเพื่อนเข้าร่วมแข่งขัน
              </span>
              <h3 className="text-sm font-bold text-white">
                ให้เพื่อนสแกน QR Code นี้ด้วยกล้องมือถือเพื่อเข้าคอร์ทได้ทันที
              </h3>
            </div>

            {/* Genuine High-Contrast Scannable QR Code */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col items-center justify-center shadow-lg text-slate-950">
              <div className="relative p-2 bg-white rounded-xl">
                {qrGenerating || !qrDataUrl ? (
                  <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-xl">
                    <span className="text-xs text-slate-500 animate-pulse font-medium">
                      กำลังสร้าง QR Code...
                    </span>
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src={qrDataUrl}
                      alt={`Badminton Hub Invite QR Code for ${inviteCode}`}
                      className="w-48 h-48 rounded-lg shadow-sm"
                    />
                    {/* Center subtle shuttlecock watermark badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white text-lg">
                        🏸
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 text-center">
                <div className="text-xs font-bold text-slate-900 tracking-wide">
                  {sessionInfo?.sessionName || 'ก๊วนแบดมินตัน'}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  สแกนผ่านกล้อง iPhone, Android หรือ LINE เพื่อเปิดหน้าจอยทันที
                </div>
              </div>

              {/* Download QR Code button */}
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`badminton-qr-${inviteCode}.png`}
                  className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-300"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>บันทึกภาพ QR Code ลงเครื่อง</span>
                </a>
              )}
            </div>

            {/* Big Code Display */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-[11px] text-slate-400">หรือบอกรหัสเข้าก๊วน (Invite Code)</span>
              <div className="text-3xl font-black text-emerald-400 tracking-widest font-mono">
                {inviteCode}
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกรหัสแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกรหัส</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newCode = regenerateInviteCode();
                    setEnteredInviteCode(newCode);
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-xl flex items-center gap-1 transition-colors border border-slate-700"
                  title="สร้างรหัสใหม่"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>สุ่มรหัสใหม่</span>
                </button>
              </div>
            </div>

            {/* Direct Join Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                หรือส่งลิงก์ตรงทาง LINE / Messenger
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
