'use client';

import React, { useState, useEffect } from 'react';
import {
  CODON_TABLE,
  AminoAcid,
  TranslatedResidue,
  getAnticodon
} from '@/lib/geneticCode';
import { playSound } from './Header';
import { Sparkles, HelpCircle, CheckCircle, AlertCircle, ArrowDown, Zap, RotateCcw } from 'lucide-react';

interface InteractiveTrnaTranslationProps {
  mrnaSequence: string; // The active mRNA (e.g. after splicing if eukaryote)
  residues: TranslatedResidue[];
  currentIndex: number; // 0 to residues.length
  onTranslateSuccess: (index: number) => void;
  onReset: () => void;
  soundEnabled: boolean;
  isComplete: boolean;
}

export default function InteractiveTrnaTranslation({
  mrnaSequence,
  residues,
  currentIndex,
  onTranslateSuccess,
  onReset,
  soundEnabled,
  isComplete,
}: InteractiveTrnaTranslationProps) {
  // Current active tRNA animation state
  const [animatingTrna, setAnimatingTrna] = useState<{
    codon: string;
    anticodon: string;
    aminoAcid: AminoAcid;
    status: 'docking' | 'bonding' | 'exiting';
  } | null>(null);

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'hint' | 'info';
    text: string;
  } | null>(null);

  const [showHint, setShowHint] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Target residue to translate
  const targetResidue = currentIndex < residues.length ? residues[currentIndex] : null;
  const targetCodon = targetResidue?.codon || '';
  const targetAminoAcid = targetResidue?.aminoAcid;

  // Handle user clicking a codon from the table
  const handleCodonSelect = (selectedCodon: string, selectedAa: AminoAcid) => {
    if (isComplete || !targetResidue || animatingTrna) return;

    // Check if the selected codon or amino acid matches the target
    // We allow matching either exact codon OR same amino acid (synonymous codons)
    const isExactCodonMatch = selectedCodon === targetCodon;
    const isSameAminoAcidMatch = selectedAa.code3 === targetAminoAcid?.code3;

    if (isExactCodonMatch || isSameAminoAcidMatch) {
      // Correct match!
      playSound('success', soundEnabled);
      setFeedbackMessage({
        type: 'success',
        text: `✓ 정답! 코돈 [${targetCodon}]에 상보적인 tRNA(안티코돈: ${targetResidue.anticodon})가 결합하여 [${selectedAa.nameKr}(${selectedAa.code3})] 아미노산이 펩타이드 사슬에 연결됩니다!`
      });

      // Trigger tRNA animation stages:
      // 1. Docking (0.5s)
      setAnimatingTrna({
        codon: targetCodon,
        anticodon: targetResidue.anticodon,
        aminoAcid: targetResidue.aminoAcid,
        status: 'docking'
      });

      // 2. Peptide bonding (after 0.5s)
      setTimeout(() => {
        setAnimatingTrna(prev => prev ? { ...prev, status: 'bonding' } : null);
      }, 500);

      // 3. Exiting (after 1s)
      setTimeout(() => {
        setAnimatingTrna(prev => prev ? { ...prev, status: 'exiting' } : null);
      }, 1000);

      // 4. Complete step & advance index (after 1.4s)
      setTimeout(() => {
        setAnimatingTrna(null);
        onTranslateSuccess(currentIndex + 1);
        setShowHint(false);
      }, 1400);

    } else {
      // Incorrect match!
      playSound('alert', soundEnabled);
      setFeedbackMessage({
        type: 'error',
        text: `✕ 틀렸습니다! 선택하신 [${selectedCodon}]은(는) [${selectedAa.nameKr}(${selectedAa.code3})]입니다. 현재 리보솜 A-자리의 코돈 [${targetCodon}]을 코돈표에서 찾아 클릭해 주세요.`
      });
    }
  };

  // 4x4 Biology standard bases
  const bases = ['U', 'C', 'A', 'G'];

  return (
    <div className="space-y-4">
      {/* 1. Live Ribosome & tRNA Docking Visualizer Window */}
      <div className="win98-window p-4 rounded shadow-md border-2 border-white dark:border-slate-700">
        <div className="flex items-center justify-between border-b border-gray-300 dark:border-slate-700 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 led-green"></span>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <span>🔬 리보솜 활성 부위 및 tRNA 결합 시뮬레이터</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                진행도: {currentIndex} / {residues.length}개 아미노산
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="win98-btn px-2.5 py-1 text-xs font-bold flex items-center gap-1 text-amber-700 dark:text-amber-300"
            >
              <HelpCircle size={13} />
              <span>{showHint ? '힌트 숨기기' : '코돈 힌트'}</span>
            </button>
            <button
              onClick={() => {
                if (targetResidue && targetAminoAcid) {
                  handleCodonSelect(targetCodon, targetAminoAcid);
                }
              }}
              disabled={isComplete || !targetResidue || animatingTrna !== null}
              className="win98-btn px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 disabled:opacity-40"
            >
              자동 1회 번역
            </button>
          </div>
        </div>

        {/* Dynamic Visual Stage: Ribosome 70S/80S Architecture */}
        <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded p-4 text-white min-h-[220px] flex flex-col justify-between overflow-hidden border border-slate-700 shadow-inner">
          {/* Ribosome Large Subunit Outline (대단량체) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-80 h-28 bg-indigo-800/40 rounded-t-full border-t-2 border-x-2 border-indigo-400/40 pointer-events-none flex items-start justify-center pt-1">
            <span className="text-[10px] text-indigo-300/80 font-mono tracking-widest uppercase">
              리보솜 대단량체 (Large Subunit: E-site / P-site / A-site)
            </span>
          </div>

          {/* Upper Area: Docking tRNA Animation or Current Translation Action */}
          <div className="relative z-10 flex items-center justify-center min-h-[110px] pt-4">
            {animatingTrna ? (
              /* Animated tRNA Molecular Graphic */
              <div
                className={`flex flex-col items-center transition-all ${
                  animatingTrna.status === 'docking'
                    ? 'animate-trna-dock'
                    : animatingTrna.status === 'bonding'
                    ? 'animate-peptide-bond'
                    : 'animate-trna-exit'
                }`}
              >
                {/* 1. Attached Amino Acid Sphere on CCA 3' end */}
                <div
                  style={{ backgroundColor: animatingTrna.aminoAcid.color }}
                  className="w-9 h-9 rounded-full flex flex-col items-center justify-center text-slate-950 font-bold text-xs shadow-lg border-2 border-white ring-2 ring-amber-300"
                >
                  <span>{animatingTrna.aminoAcid.code3}</span>
                  <span className="text-[8px] opacity-75">{animatingTrna.aminoAcid.code1}</span>
                </div>

                {/* 2. CCA 3' Stem Connection */}
                <div className="w-1.5 h-3 bg-amber-400"></div>

                {/* 3. tRNA Adapter Body (클로버잎/L-모양 어댑터 분자) */}
                <div className="w-14 h-14 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-t-xl rounded-b-md flex flex-col items-center justify-between p-1.5 text-white shadow-xl border border-indigo-300">
                  <div className="flex items-center justify-between w-full px-1 text-[8px] text-indigo-200">
                    <span>tRNA</span>
                    <span>3&apos;CCA</span>
                  </div>

                  {/* Anticodon Loop (안티코돈 루프) */}
                  <div className="w-full bg-black/60 rounded py-0.5 flex flex-col items-center">
                    <span className="text-[7px] text-gray-300">안티코돈(3&apos;→5&apos;)</span>
                    <span className="font-mono font-black text-xs text-amber-300 tracking-wider">
                      {animatingTrna.anticodon}
                    </span>
                  </div>
                </div>

                {/* 4. Hydrogen bonding lines connecting to mRNA */}
                <div className="flex gap-2 text-xs text-yellow-300 font-mono font-bold animate-pulse -my-0.5">
                  <span>:</span>
                  <span>:</span>
                  <span>:</span>
                </div>
              </div>
            ) : !isComplete && targetResidue ? (
              /* Idle / Waiting for user to pick codon */
              <div className="flex flex-col items-center justify-center text-center p-2 rounded bg-indigo-900/40 border border-indigo-500/30">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs mb-1">
                  <ArrowDown size={14} className="animate-bounce" />
                  <span>현재 번역 대상 코돈: #{currentIndex + 1}번째 코돈 [{targetCodon}]</span>
                </div>
                <p className="text-[11px] text-gray-300 max-w-md">
                  하단의 <strong className="text-amber-200">유전 암호표(코돈표)</strong>에서 코돈 <strong className="text-white underline">[{targetCodon}]</strong> 또는 이에 대응하는 아미노산
                  {showHint && <span className="text-emerald-300 font-bold ml-1">({targetAminoAcid?.nameKr} - {targetAminoAcid?.code3})</span>}
                  을 직접 클릭해 주세요!
                </p>
              </div>
            ) : (
              /* Complete celebration */
              <div className="flex flex-col items-center justify-center text-center p-3">
                <span className="text-2xl mb-1">🎉</span>
                <span className="font-bold text-sm text-emerald-400">번역 완료 (Translation Completed)!</span>
                <span className="text-xs text-gray-300">모든 코돈이 성공적으로 폴리펩타이드 사슬로 번역되었습니다.</span>
              </div>
            )}
          </div>

          {/* Middle Track: mRNA strand passing through Ribosome cleft */}
          <div className="relative z-10 bg-slate-950/80 p-2.5 rounded border border-slate-700/80 mt-2 font-mono text-xs flex items-center overflow-x-auto">
            <span className="font-bold text-cyan-400 shrink-0 mr-2">5&apos; mRNA:</span>
            <div className="flex items-center gap-1">
              {residues.map((res, idx) => {
                const isCurrent = idx === currentIndex && !isComplete;
                const isDone = idx < currentIndex;
                return (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded text-center transition font-bold ${
                      isCurrent
                        ? 'bg-amber-400 text-black ring-2 ring-white scale-110 shadow-lg animate-pulse'
                        : isDone
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600/60'
                        : 'bg-slate-800 text-gray-400 border border-slate-700'
                    }`}
                  >
                    <div>{res.codon}</div>
                    <div className="text-[9px] opacity-75 font-sans">
                      {isDone ? res.aminoAcid.code3 : isCurrent ? 'A-site' : `#${idx + 1}`}
                    </div>
                  </div>
                );
              })}
            </div>
            <span className="font-bold text-cyan-400 shrink-0 ml-2">3&apos;</span>
          </div>

          {/* Lower Area: Polypeptide chain (Growing peptide beads) */}
          <div className="relative z-10 mt-3 pt-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-bold text-amber-400 shrink-0 text-[11px]">합성된 단백질 사슬:</span>
            {currentIndex > 0 ? (
              <div className="flex items-center gap-1">
                {residues.slice(0, currentIndex).map((res, idx) => (
                  <div key={idx} className="flex items-center">
                    <span
                      style={{ backgroundColor: res.aminoAcid.color }}
                      className="px-2 py-0.5 rounded text-slate-950 font-bold text-[11px] shadow-sm border border-white/50"
                      title={`${res.aminoAcid.nameKr} (${res.aminoAcid.nameEn})`}
                    >
                      {res.aminoAcid.code3}
                    </span>
                    {idx < currentIndex - 1 && (
                      <span className="w-1.5 h-0.5 bg-gray-400 mx-0.5"></span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-gray-500 italic">아직 번역 개시 전입니다. 코돈표에서 아미노산을 선택하세요.</span>
            )}
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMessage && (
          <div
            className={`mt-3 p-2.5 rounded text-xs flex items-center justify-between border ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-400'
                : feedbackMessage.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-400'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle size={15} className="text-emerald-600 shrink-0" />
              ) : feedbackMessage.type === 'error' ? (
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
              ) : (
                <Sparkles size={15} className="text-blue-600 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 2. Embedded Interactive Codon Table (클릭식 유전 암호표) */}
      <div className="win98-window p-4 rounded shadow-md border-2 border-white dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-300 dark:border-slate-700 pb-2 mb-3">
          <div>
            <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <span>📊 인터랙티브 유전 암호표 (코돈표를 눌러 직접 번역)</span>
            </h3>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
              mRNA 코돈을 확인한 뒤 해당하는 아미노산(코돈) 칸을 직접 클릭하면 tRNA 결합 및 펩타이드 합성이 진행됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="코돈 또는 아미노산 필터..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded outline-none"
            />
          </div>
        </div>

        {/* 4x4 Standard Codon Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {bases.map(firstBase => (
            <div
              key={firstBase}
              className="neu-card p-2.5 border border-gray-300 dark:border-slate-700 rounded space-y-1.5"
            >
              <div className="font-bold text-center py-1 bg-gray-200 dark:bg-slate-800 rounded text-gray-800 dark:text-gray-200 font-mono">
                첫 번째 염기: <strong className="text-blue-600 dark:text-blue-400">{firstBase}</strong>
              </div>

              <div className="space-y-1">
                {bases.flatMap(secondBase =>
                  bases.map(thirdBase => {
                    const codon = `${firstBase}${secondBase}${thirdBase}`;
                    const aa = CODON_TABLE[codon];
                    if (!aa) return null;

                    // Filtering
                    if (
                      searchFilter &&
                      !codon.toLowerCase().includes(searchFilter.toLowerCase()) &&
                      !aa.code3.toLowerCase().includes(searchFilter.toLowerCase()) &&
                      !aa.nameKr.includes(searchFilter)
                    ) {
                      return null;
                    }

                    const isTarget = codon === targetCodon && !isComplete;
                    const isHinted = showHint && (codon === targetCodon || aa.code3 === targetAminoAcid?.code3);

                    return (
                      <button
                        key={codon}
                        onClick={() => handleCodonSelect(codon, aa)}
                        disabled={isComplete || animatingTrna !== null}
                        className={`w-full text-left p-1.5 rounded transition border flex items-center justify-between ${
                          isHinted
                            ? 'ring-2 ring-amber-500 bg-amber-100 dark:bg-amber-950/80 font-bold scale-102 shadow-md animate-bounce'
                            : isTarget
                            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:scale-101'
                            : 'win98-btn hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs tracking-wider">{codon}</span>
                          <span
                            style={{ backgroundColor: aa.color }}
                            className="px-1.5 py-0.2 rounded text-[10px] text-slate-950 font-bold"
                          >
                            {aa.code3}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 dark:text-gray-400">
                          {aa.property === 'start' ? (
                            <span className="text-amber-600 font-bold">개시</span>
                          ) : aa.property === 'stop' ? (
                            <span className="text-rose-600 font-bold">종결</span>
                          ) : (
                            aa.nameKr
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
