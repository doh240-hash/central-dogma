'use client';

import React from 'react';
import { Sun, Moon, Volume2, VolumeX, Sparkles, Activity, Server, Database } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export function playSound(type: 'click' | 'success' | 'alert' | 'step', enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'step') {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'alert') {
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {
    // AudioContext blocked or unsupported
  }
}

export default function Header({
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
}: HeaderProps) {
  return (
    <header className="w-full">
      {/* Retro Windows 98 Titlebar */}
      <div className="bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080] dark:from-[#0f172a] dark:via-[#1e3a8a] dark:to-[#0f172a] text-white px-3 py-1.5 flex items-center justify-between shadow-sm select-none border-b border-black/20">
        <div className="flex items-center gap-2">
          {/* Retro Floppy / DNA Icon */}
          <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-sm flex items-center justify-center text-xs font-bold text-white shadow-inner">
            🧬
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-wide flex items-center gap-1.5 drop-shadow">
            CENTRAL_DOGMA.EXE - 센트럴도그마 분자생물학 시뮬레이터 v1.0
            <span className="hidden md:inline-block text-[10px] bg-blue-900/80 px-1.5 py-0.5 rounded border border-blue-400/40 text-blue-200">
              Seoul [icn1]
            </span>
          </span>
        </div>

        {/* Win98 Window Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSound('click', true);
            }}
            title={soundEnabled ? '효과음 켜짐' : '효과음 음소거'}
            className="win98-btn w-6 h-6 flex items-center justify-center text-black dark:text-white text-xs hover:bg-gray-200"
          >
            {soundEnabled ? <Volume2 size={13} className="text-emerald-600 dark:text-emerald-400" /> : <VolumeX size={13} className="text-gray-500" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              setDarkMode(!darkMode);
              playSound('click', soundEnabled);
            }}
            title="다크/라이트 모드 전환"
            className="win98-btn w-6 h-6 flex items-center justify-center text-black dark:text-white text-xs hover:bg-gray-200"
          >
            {darkMode ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-indigo-600" />}
          </button>

          {/* Minimize / Maximize / Close Deco buttons */}
          <div className="hidden sm:flex items-center gap-1 ml-1">
            <button className="win98-btn w-6 h-6 flex items-center justify-center text-black dark:text-white font-bold text-[10px]">
              _
            </button>
            <button className="win98-btn w-6 h-6 flex items-center justify-center text-black dark:text-white font-bold text-[10px]">
              □
            </button>
            <button className="win98-btn w-6 h-6 flex items-center justify-center text-black dark:text-white font-bold text-[10px] text-red-600">
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Skeuomorphic & Neumorphic Sub-bar with Live Region Metrics */}
      <div className="px-4 py-2 bg-gradient-to-b from-[#e8ecf2] to-[#d6dde8] dark:from-[#172238] dark:to-[#0f172a] border-b border-gray-300 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/70 dark:bg-black/30 shadow-inner border border-gray-200 dark:border-gray-700">
            <span className="w-2 h-2 rounded-full led-green"></span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">중심원리 엔진 정상 가동</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Sparkles size={13} className="text-indigo-500" />
            <span>DNA → RNA(전사) → 단백질(번역) 가상 시뮬레이션</span>
          </div>
        </div>

        {/* Seoul Region RTT Indicator Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-[11px] shadow-neu-flat">
            <Server size={12} className="text-cyan-400" />
            <span>Vercel [icn1 서울]</span>
            <span className="text-gray-500">|</span>
            <Database size={12} className="text-emerald-400" />
            <span>Supabase [ap-northeast-2]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-300 font-bold ml-1">~3ms</span>
          </div>
        </div>
      </div>
    </header>
  );
}
