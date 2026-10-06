'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SimulationView from '@/components/SimulationView';
import ComparisonGuide from '@/components/ComparisonGuide';
import QuizRankings from '@/components/QuizRankings';
import CommunityBoard from '@/components/CommunityBoard';
import CodonModal from '@/components/CodonModal';
import { playSound } from '@/components/Header';
import { FlaskConical, BookOpen, Trophy, MessageSquare, Terminal, ExternalLink } from 'lucide-react';

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'simulation' | 'comparison' | 'quiz' | 'community'>('simulation');
  const [isCodonModalOpen, setIsCodonModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Set dark class on html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'simulation', label: '🔬 중심원리 가상 실험실', icon: FlaskConical },
    { id: 'comparison', label: '🧬 원핵 vs 진핵 비교 도감', icon: BookOpen },
    { id: 'quiz', label: '🏆 스피드 퀴즈 & 랭킹', icon: Trophy },
    { id: 'community', label: '💬 탐구 토론방 & Q&A', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#c0c0c0] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Application Bar */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
        {/* Retro Tab Navigation Strip */}
        <div className="flex items-center gap-1 border-b-2 border-gray-400 dark:border-slate-700 overflow-x-auto pb-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  playSound('click', soundEnabled);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t transition border-t-2 border-x-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#ece9d8] dark:bg-slate-800 border-white dark:border-slate-600 border-b-transparent text-blue-900 dark:text-blue-300 shadow-xs -mb-[2px] z-10'
                    : 'bg-[#d4d0c8] dark:bg-slate-900/60 border-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="animate-fade-in">
          {activeTab === 'simulation' && (
            <SimulationView
              soundEnabled={soundEnabled}
              onOpenCodonModal={() => setIsCodonModalOpen(true)}
            />
          )}

          {activeTab === 'comparison' && <ComparisonGuide />}

          {activeTab === 'quiz' && <QuizRankings soundEnabled={soundEnabled} />}

          {activeTab === 'community' && <CommunityBoard soundEnabled={soundEnabled} />}
        </div>
      </main>

      {/* Codon Modal */}
      <CodonModal
        isOpen={isCodonModalOpen}
        onClose={() => setIsCodonModalOpen(false)}
      />

      {/* Windows 98 Retro Taskbar & Footer */}
      <footer className="w-full bg-[#c0c0c0] dark:bg-[#1e293b] border-t-2 border-white dark:border-slate-700 p-1 flex items-center justify-between text-xs select-none shadow-md">
        <div className="flex items-center gap-2">
          {/* Start Button */}
          <div className="win98-btn px-2.5 py-1 flex items-center gap-1.5 font-black text-xs cursor-pointer hover:bg-gray-200">
            <span className="text-sm">🪟</span>
            <span>시작 (Start)</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2 border-l border-gray-400 dark:border-slate-700 text-[11px] text-gray-700 dark:text-gray-300">
            <span>센트럴도그마 (Central Dogma) 교육 시뮬레이션</span>
            <span className="text-gray-400">|</span>
            <span className="font-mono">Next.js 14 · Tailwind CSS · Supabase DB</span>
          </div>
        </div>

        {/* System Tray (Clock & Region status) */}
        <div className="win98-box-sunken px-3 py-1 flex items-center gap-3 text-[11px] font-mono text-gray-800 dark:text-gray-200">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>icn1(서울)</span>
          </span>
          <span className="font-bold">{currentTime || '18:59:00'}</span>
        </div>
      </footer>
    </div>
  );
}
