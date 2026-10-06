'use client';

import React, { useState } from 'react';
import { CODON_TABLE, AminoAcid } from '@/lib/geneticCode';
import { Search, X, Info } from 'lucide-react';

interface CodonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCodon?: (codon: string) => void;
}

export default function CodonModal({ isOpen, onClose, onSelectCodon }: CodonModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProp, setFilterProp] = useState<string>('all');
  const [selectedCodonInfo, setSelectedCodonInfo] = useState<{ codon: string; aa: AminoAcid } | null>(null);

  if (!isOpen) return null;

  const bases = ['U', 'C', 'A', 'G'];
  const allCodons = Object.entries(CODON_TABLE);

  const filteredCodons = allCodons.filter(([codon, aa]) => {
    const matchesSearch =
      codon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aa.code3.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aa.nameKr.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterProp === 'all') return matchesSearch;
    if (filterProp === 'start') return matchesSearch && aa.property === 'start';
    if (filterProp === 'stop') return matchesSearch && aa.property === 'stop';
    return matchesSearch && aa.property === filterProp;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="win98-window w-full max-w-4xl max-h-[90vh] flex flex-col rounded-sm overflow-hidden shadow-2xl border-2 border-white dark:border-slate-700">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-3 py-1.5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span>🧬 표준 유전 암호표 (Standard Genetic Code Codon Table)</span>
          </div>
          <button
            onClick={onClose}
            className="win98-btn w-6 h-6 flex items-center justify-center text-black dark:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 bg-[#ece9d8] dark:bg-slate-900 text-slate-900 dark:text-slate-100 space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-700 shadow-inner">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="코돈(AUG), 아미노산(Met, 메티오닌) 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent outline-none border-b border-gray-300 dark:border-slate-600 focus:border-blue-500 px-1 py-0.5"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-gray-500 mr-1">분류:</span>
              {[
                { id: 'all', label: '전체 (64)' },
                { id: 'start', label: '개시(AUG)' },
                { id: 'stop', label: '종결(Stop)' },
                { id: 'hydrophobic', label: '소수성' },
                { id: 'polar', label: '극성' },
                { id: 'basic', label: '염기성(+)' },
                { id: 'acidic', label: '산성(-)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterProp(f.id)}
                  className={`px-2.5 py-1 text-xs rounded transition ${
                    filterProp === f.id
                      ? 'win98-btn-active bg-blue-600 text-white font-bold shadow-inner'
                      : 'win98-btn text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs p-2.5 bg-gray-100 dark:bg-slate-800/60 rounded border border-gray-300 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              <span>개시 코돈 (AUG - Met)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500"></span>
              <span>종결 코돈 (UAA, UAG, UGA)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-sky-400"></span>
              <span>비극성 / 소수성 (Hydrophobic)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-400"></span>
              <span>극성 / 비하전 (Polar)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-purple-500"></span>
              <span>전하성 (산성/염기성)</span>
            </div>
          </div>

          {/* Codon Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {filteredCodons.map(([codon, aa]) => (
              <div
                key={codon}
                onClick={() => {
                  setSelectedCodonInfo({ codon, aa });
                  if (onSelectCodon) onSelectCodon(codon);
                }}
                className={`p-2 rounded cursor-pointer transition border hover:scale-105 ${
                  aa.property === 'start'
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 font-bold text-amber-900 dark:text-amber-200'
                    : aa.property === 'stop'
                    ? 'bg-red-100 dark:bg-red-950/60 border-red-400 font-bold text-red-900 dark:text-red-200'
                    : aa.property === 'hydrophobic'
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 text-sky-950 dark:text-sky-200'
                    : aa.property === 'polar'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-950 dark:text-emerald-200'
                    : 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 text-purple-950 dark:text-purple-200'
                } shadow-xs`}
              >
                <div className="font-mono text-base font-extrabold tracking-wider">{codon}</div>
                <div className="text-xs font-semibold mt-0.5">{aa.code3} ({aa.code1})</div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400 truncate">{aa.nameKr}</div>
              </div>
            ))}
          </div>

          {/* Selected Codon Detailed Inspector */}
          {selectedCodonInfo && (
            <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded border border-blue-300 dark:border-blue-700 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-lg text-blue-700 dark:text-blue-400">
                  {selectedCodonInfo.codon}
                </span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="font-bold text-sm">
                  {selectedCodonInfo.aa.nameKr} ({selectedCodonInfo.aa.nameEn}) - {selectedCodonInfo.aa.code3} / {selectedCodonInfo.aa.code1}
                </span>
                <span className="ml-3 text-xs px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  화학적 특성: {selectedCodonInfo.aa.property}
                </span>
              </div>
              <button
                onClick={() => setSelectedCodonInfo(null)}
                className="text-gray-500 hover:text-black dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-200 dark:bg-slate-800 border-t border-gray-300 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="win98-btn px-5 py-1.5 text-xs font-bold"
          >
            닫기 (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
