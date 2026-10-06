'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PRESETS,
  SimulationPreset,
  CODON_TABLE,
  getComplementaryDna,
  transcribeToRna,
  translateMrna,
  getAnticodon,
  TranslatedResidue
} from '@/lib/geneticCode';
import { playSound } from './Header';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Zap,
  Info,
  Sliders,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  HelpCircle,
  Check,
  MousePointerClick
} from 'lucide-react';
import InteractiveTrnaTranslation from './InteractiveTrnaTranslation';


interface SimulationViewProps {
  soundEnabled: boolean;
  onOpenCodonModal: () => void;
}

export default function SimulationView({ soundEnabled, onOpenCodonModal }: SimulationViewProps) {
  // Mode: Eukaryote vs Prokaryote
  const [organismMode, setOrganismMode] = useState<'eukaryote' | 'prokaryote'>('eukaryote');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standard');
  const [dnaInput, setDnaInput] = useState<string>(PRESETS[0].dnaCodingStrand);
  
  // Simulation playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 2x
  // Stages: 0: DNA Rest, 1: Transcription, 2: RNA Processing (if eukaryote), 3: Translation, 4: Complete
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [transcriptionProgress, setTranscriptionProgress] = useState<number>(0); // index in DNA
  const [translationProgress, setTranslationProgress] = useState<number>(0); // index in codons
  const [splicingDone, setSplicingDone] = useState<boolean>(false);
  const [capTailDone, setCapTailDone] = useState<boolean>(false);
  const [activeMutationNote, setActiveMutationNote] = useState<string | null>(null);

  // Derive biological data
  const dnaCoding = useMemo(() => dnaInput.toUpperCase().replace(/[^ATGC]/g, ''), [dnaInput]);
  const dnaTemplate = useMemo(() => getComplementaryDna(dnaCoding), [dnaCoding]);
  const rawMrna = useMemo(() => transcribeToRna(dnaCoding), [dnaCoding]);

  // For Eukaryotes, simulate an intron in the middle if sequence is long enough
  const currentPreset = useMemo(() => PRESETS.find(p => p.id === selectedPresetId) || PRESETS[0], [selectedPresetId]);
  
  const processedMrna = useMemo(() => {
    if (organismMode === 'prokaryote') {
      return rawMrna;
    }
    // Eukaryote splicing
    if (currentPreset.intronRanges && currentPreset.intronRanges.length > 0) {
      const [start, end] = currentPreset.intronRanges[0];
      if (start < rawMrna.length && end <= rawMrna.length) {
        return rawMrna.slice(0, start) + rawMrna.slice(end);
      }
    }
    return rawMrna;
  }, [rawMrna, organismMode, currentPreset]);

  // Active mRNA used for translation
  const activeMrnaForTranslation = organismMode === 'eukaryote' && splicingDone ? processedMrna : rawMrna;
  const translationResult = useMemo(() => translateMrna(activeMrnaForTranslation), [activeMrnaForTranslation]);

  // Handle Preset change
  const handleSelectPreset = (preset: SimulationPreset) => {
    setSelectedPresetId(preset.id);
    setDnaInput(preset.dnaCodingStrand);
    resetSimulation();
    setActiveMutationNote(null);
    playSound('click', soundEnabled);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentStage(0);
    setTranscriptionProgress(0);
    setTranslationProgress(0);
    setSplicingDone(false);
    setCapTailDone(false);
  };

  // Step Forward Logic
  const stepForward = () => {
    playSound('step', soundEnabled);

    // Stage 0 -> 1: Start Transcription
    if (currentStage === 0) {
      setCurrentStage(1);
      setTranscriptionProgress(3);
      return;
    }

    // Stage 1: Transcribing
    if (currentStage === 1) {
      if (transcriptionProgress + 3 <= dnaCoding.length) {
        setTranscriptionProgress(prev => prev + 3);
        // In prokaryotes, translation can start concurrently!
        if (organismMode === 'prokaryote' && transcriptionProgress >= 6 && translationProgress < translationResult.residues.length) {
          setTranslationProgress(prev => Math.min(prev + 1, translationResult.residues.length));
        }
      } else {
        setTranscriptionProgress(dnaCoding.length);
        if (organismMode === 'eukaryote') {
          setCurrentStage(2); // RNA Processing
        } else {
          setCurrentStage(3); // Translation continues
        }
      }
      return;
    }

    // Stage 2: Eukaryote RNA Processing
    if (currentStage === 2) {
      if (!capTailDone) {
        setCapTailDone(true);
      } else if (!splicingDone) {
        setSplicingDone(true);
      } else {
        setCurrentStage(3); // Move to Translation
        setTranslationProgress(1);
      }
      return;
    }

    // Stage 3: Translation
    if (currentStage === 3) {
      if (translationProgress < translationResult.residues.length) {
        setTranslationProgress(prev => prev + 1);
      } else {
        setCurrentStage(4); // Complete
        setIsPlaying(false);
        playSound('success', soundEnabled);
      }
      return;
    }

    if (currentStage === 4) {
      resetSimulation();
    }
  };

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = Math.max(200, 800 / playbackSpeed);
    const timer = setInterval(() => {
      stepForward();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, currentStage, transcriptionProgress, translationProgress, splicingDone, capTailDone, dnaCoding.length, translationResult.residues.length, organismMode]);

  // Point Mutation Injector
  const applyPointMutation = (type: 'missense' | 'nonsense' | 'silent' | 'frameshift') => {
    resetSimulation();
    playSound('alert', soundEnabled);

    if (type === 'missense') {
      // e.g., Sickle cell mutation GAG -> GTG
      const idx = dnaCoding.indexOf('GAG');
      if (idx !== -1) {
        const mutated = dnaCoding.slice(0, idx) + 'GTG' + dnaCoding.slice(idx + 3);
        setDnaInput(mutated);
        setActiveMutationNote('미스센스 돌연변이: GAG(글루탐산: 친수성) → GTG(발린: 소수성)로 변경되었습니다. (헤모글로빈 응집 유발)');
      } else {
        // change 7th base
        const mutated = dnaCoding.slice(0, 6) + 'T' + dnaCoding.slice(7);
        setDnaInput(mutated);
        setActiveMutationNote('미스센스 돌연변이: 7번째 염기 변이로 다른 아미노산이 지정됩니다.');
      }
    } else if (type === 'nonsense') {
      // create premature stop codon e.g. TAA, TAG, TGA
      const idx = Math.min(9, dnaCoding.length - 3);
      const mutated = dnaCoding.slice(0, idx) + 'TAA' + dnaCoding.slice(idx + 3);
      setDnaInput(mutated);
      setActiveMutationNote('난센스 돌연변이: 조기 종결 코돈(UAA)이 도입되어 비정상적으로 짧은 펩타이드가 합성됩니다.');
    } else if (type === 'silent') {
      // change 3rd base of codon without changing AA (wobble base)
      // e.g. GGC -> GGT (both Gly) or CCC -> CCT
      const mutated = dnaCoding.slice(0, 2) + (dnaCoding[2] === 'C' ? 'T' : 'C') + dnaCoding.slice(3);
      setDnaInput(mutated);
      setActiveMutationNote('동의(침묵) 돌연변이: 염기는 치환되었으나 코돈 축퇴성으로 동일한 아미노산이 합성됩니다.');
    } else if (type === 'frameshift') {
      // Insert one 'A' after position 4
      const mutated = dnaCoding.slice(0, 4) + 'A' + dnaCoding.slice(4);
      setDnaInput(mutated);
      setActiveMutationNote('틀이동(Frameshift) 돌연변이: 염기 1개가 삽입되어 이후 모든 코돈의 리딩 프레임이 파괴되었습니다.');
    }
  };

  // Color map for nucleotides
  const getBaseBadge = (base: string, label?: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-rose-500 text-white border-rose-600',
      'T': 'bg-blue-600 text-white border-blue-700',
      'U': 'bg-sky-500 text-white border-sky-600',
      'G': 'bg-emerald-600 text-white border-emerald-700',
      'C': 'bg-amber-500 text-white border-amber-600',
    };
    return (
      <span
        className={`inline-flex flex-col items-center justify-center font-mono font-bold text-xs w-6 h-7 rounded-sm border shadow-xs ${
          colors[base] || 'bg-gray-400 text-white border-gray-500'
        }`}
      >
        <span>{base}</span>
        {label && <span className="text-[8px] opacity-80">{label}</span>}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Control Console (Skeuomorphic & Retro Win98 Dashboard) */}
      <div className="win98-window p-3 sm:p-4 rounded shadow-md border-2 border-white dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-300 dark:border-slate-700 pb-3">
          {/* Organism Mode Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Layers size={14} className="text-blue-600" />
              생물 체계 모드:
            </span>
            <div className="flex items-center p-1 rounded-sm bg-gray-200 dark:bg-slate-800 border border-gray-400 dark:border-slate-600 shadow-inner">
              <button
                onClick={() => {
                  setOrganismMode('eukaryote');
                  resetSimulation();
                  playSound('click', soundEnabled);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-xs transition ${
                  organismMode === 'eukaryote'
                    ? 'win98-btn-active bg-purple-700 text-white shadow-inner'
                    : 'win98-btn text-gray-700 dark:text-gray-300'
                }`}
              >
                진핵생물 (Eukaryote: 스플라이싱)
              </button>
              <button
                onClick={() => {
                  setOrganismMode('prokaryote');
                  resetSimulation();
                  playSound('click', soundEnabled);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-xs transition ${
                  organismMode === 'prokaryote'
                    ? 'win98-btn-active bg-emerald-700 text-white shadow-inner'
                    : 'win98-btn text-gray-700 dark:text-gray-300'
                }`}
              >
                원핵생물 (Prokaryote: 동시 전사-번역)
              </button>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">유전자 프리셋:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => {
                const found = PRESETS.find(p => p.id === e.target.value);
                if (found) handleSelectPreset(found);
              }}
              className="text-xs bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-400 dark:border-slate-600 px-2 py-1 rounded shadow-inner outline-none font-medium"
            >
              {PRESETS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Playback Controls & Skeuomorphic Knobs */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Play / Pause button */}
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                playSound('click', soundEnabled);
              }}
              className={`win98-btn px-4 py-1.5 flex items-center gap-1.5 text-xs font-bold ${
                isPlaying ? 'bg-amber-400 text-black' : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? '일시정지 (PAUSE)' : '시뮬레이션 시작 (PLAY)'}</span>
            </button>

            {/* Step button */}
            <button
              onClick={stepForward}
              className="win98-btn px-3 py-1.5 flex items-center gap-1 text-xs font-bold text-gray-800 dark:text-gray-200"
            >
              <SkipForward size={14} />
              <span>1단계 진행 (STEP)</span>
            </button>

            {/* Reset button */}
            <button
              onClick={() => {
                resetSimulation();
                playSound('click', soundEnabled);
              }}
              className="win98-btn px-3 py-1.5 flex items-center gap-1 text-xs font-bold text-gray-800 dark:text-gray-200"
            >
              <RotateCcw size={14} />
              <span>초기화 (RESET)</span>
            </button>
          </div>

          {/* Speed & Stage Status */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-600 dark:text-gray-400">속도:</span>
              {[0.5, 1, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    playbackSpeed === speed
                      ? 'win98-btn-active bg-blue-600 text-white'
                      : 'win98-btn text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              onClick={onOpenCodonModal}
              className="win98-btn px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1"
            >
              <span>📊 코돈 표 보기</span>
            </button>
          </div>
        </div>

        {/* Mutation Toolbar */}
        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            <span className="font-bold text-gray-700 dark:text-gray-300">돌연변이 시뮬레이션:</span>
            <button
              onClick={() => applyPointMutation('missense')}
              className="win98-btn px-2 py-0.5 text-xs text-rose-700 dark:text-rose-300 hover:bg-rose-50"
            >
              미스센스 (낫적혈구 GAG→GTG)
            </button>
            <button
              onClick={() => applyPointMutation('nonsense')}
              className="win98-btn px-2 py-0.5 text-xs text-orange-700 dark:text-orange-300 hover:bg-orange-50"
            >
              난센스 (조기 종결 UAA)
            </button>
            <button
              onClick={() => applyPointMutation('silent')}
              className="win98-btn px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-50"
            >
              동의/침묵 (아미노산 불변)
            </button>
            <button
              onClick={() => applyPointMutation('frameshift')}
              className="win98-btn px-2 py-0.5 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-50"
            >
              틀이동 (+1 염기 삽입)
            </button>
          </div>
        </div>

        {activeMutationNote && (
          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info size={14} className="shrink-0 text-amber-600" />
              <span>{activeMutationNote}</span>
            </div>
            <button onClick={() => setActiveMutationNote(null)} className="font-bold ml-2">✕</button>
          </div>
        )}
      </div>

      {/* Main Interactive Stage Screen (Y2K CRT & Neumorphic Visualizer) */}
      <div className="neu-card p-4 sm:p-5 border border-gray-300 dark:border-slate-800 space-y-6">
        {/* Stage Progress Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs select-none">
          {[
            { stage: 0, label: '1. DNA 이중나선', desc: '염기서열 준비' },
            { stage: 1, label: '2. 전사 (Transcription)', desc: 'RNA 중합효소 활성' },
            {
              stage: 2,
              label: organismMode === 'eukaryote' ? '3. RNA 가공 (Processing)' : '3. 가공 생략 (원핵 특성)',
              desc: organismMode === 'eukaryote' ? '5\'Cap/스플라이싱/Poly-A' : '원본 mRNA 즉시 번역'
            },
            { stage: 3, label: '4. 번역 (Translation)', desc: '리보솜 & 폴리펩타이드' },
          ].map(s => (
            <div
              key={s.stage}
              className={`p-2 rounded border transition ${
                currentStage === s.stage
                  ? 'bg-blue-600 text-white border-blue-700 shadow-md font-bold'
                  : currentStage > s.stage
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-400 font-semibold'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-500 border-gray-300 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{s.label}</span>
                {currentStage > s.stage && <Check size={12} />}
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Visual Track 1: DNA Double Strand */}
        <div className="win98-box-sunken p-3 rounded font-mono overflow-x-auto">
          <div className="flex items-center justify-between mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              DNA 이중나선 (Double Helix Strands)
            </span>
            <span className="text-[11px] text-gray-500 font-normal">
              총 {dnaCoding.length}개 염기 | 5&apos; → 3&apos; 코딩가닥 & 3&apos; → 5&apos; 주형가닥
            </span>
          </div>

          <div className="space-y-1.5 text-xs py-1">
            {/* Coding Strand (5' -> 3') */}
            <div className="flex items-center gap-1">
              <span className="w-16 font-bold text-blue-600 dark:text-blue-400 shrink-0 text-right pr-2">
                5&apos; 코딩:
              </span>
              <div className="flex items-center gap-0.5">
                {dnaCoding.split('').map((base, i) => (
                  <div
                    key={i}
                    className={`relative transition ${
                      currentStage === 1 && i < transcriptionProgress ? 'ring-2 ring-amber-400 scale-105' : ''
                    }`}
                  >
                    {getBaseBadge(base)}
                  </div>
                ))}
              </div>
              <span className="font-bold text-blue-600 dark:text-blue-400 pl-2">3&apos;</span>
            </div>

            {/* Hydrogen bonds symbol */}
            <div className="flex items-center gap-1 opacity-40">
              <span className="w-16 shrink-0"></span>
              <div className="flex items-center gap-0.5">
                {dnaCoding.split('').map((_, i) => (
                  <div key={i} className="w-6 text-center text-[10px] text-gray-400">
                    :
                  </div>
                ))}
              </div>
            </div>

            {/* Template Strand (3' -> 5') */}
            <div className="flex items-center gap-1">
              <span className="w-16 font-bold text-purple-600 dark:text-purple-400 shrink-0 text-right pr-2">
                3&apos; 주형:
              </span>
              <div className="flex items-center gap-0.5">
                {dnaTemplate.split('').map((base, i) => (
                  <div key={i}>
                    {getBaseBadge(base)}
                  </div>
                ))}
              </div>
              <span className="font-bold text-purple-600 dark:text-purple-400 pl-2">5&apos;</span>
            </div>
          </div>
        </div>

        {/* Visual Track 2: RNA Polymerase & mRNA Transcription */}
        <div className="win98-box-sunken p-3 rounded font-mono overflow-x-auto relative min-h-[90px]">
          <div className="flex items-center justify-between mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 led-green"></span>
              전사 산물: 전령 RNA (mRNA Strand, 5&apos; → 3&apos;)
            </span>
            {currentStage === 1 && (
              <span className="text-[11px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold animate-pulse">
                RNA 중합효소(RNA Pol) 전사 이동 중... [{transcriptionProgress}/{dnaCoding.length}]
              </span>
            )}
          </div>

          {currentStage >= 1 ? (
            <div className="flex items-center gap-1 pt-1">
              <span className="w-16 font-bold text-cyan-600 dark:text-cyan-400 shrink-0 text-right pr-2">
                5&apos; mRNA:
              </span>
              <div className="flex items-center gap-0.5">
                {rawMrna.slice(0, currentStage === 1 ? transcriptionProgress : rawMrna.length).split('').map((base, i) => (
                  <div key={i} className="animate-fade-in">
                    {getBaseBadge(base)}
                  </div>
                ))}
              </div>
              <span className="font-bold text-cyan-600 dark:text-cyan-400 pl-2">3&apos;</span>
            </div>
          ) : (
            <div className="text-xs text-gray-400 dark:text-gray-600 italic py-2 text-center">
              [전사 대기 중] 상단의 '시뮬레이션 시작' 또는 '1단계 진행'을 눌러 RNA 중합효소를 가동하세요.
            </div>
          )}
        </div>

        {/* Visual Track 3: Eukaryote Processing vs Prokaryote Polysome Coupling */}
        {organismMode === 'eukaryote' ? (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-300 dark:border-purple-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                진핵생물 특이적 전구체 mRNA 가공 (5&apos; Cap, Splicing, 3&apos; Poly-A)
              </span>
              <span className="text-[11px] text-purple-700 dark:text-purple-400 font-normal">
                {splicingDone ? '✓ 성숙 mRNA 완성 (세포질 수송 완료)' : '가공 대기 중'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              {/* 5' Cap Badge */}
              <div className={`px-2.5 py-1 rounded border font-mono ${
                capTailDone || currentStage >= 3
                  ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                5&apos; 7-메틸구아노신 Cap {capTailDone || currentStage >= 3 ? '✓' : ''}
              </div>

              {/* Splicing Badge */}
              <div className={`px-2.5 py-1 rounded border font-mono ${
                splicingDone || currentStage >= 3
                  ? 'bg-purple-100 border-purple-400 text-purple-900 font-bold'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                스플라이싱 (Intron 절단 & Exon 결합) {splicingDone || currentStage >= 3 ? '✓' : ''}
              </div>

              {/* Poly-A Tail */}
              <div className={`px-2.5 py-1 rounded border font-mono ${
                capTailDone || currentStage >= 3
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                3&apos; Poly-A 꼬리 (AAAA...) {capTailDone || currentStage >= 3 ? '✓' : ''}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-300 dark:border-emerald-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 led-green"></span>
                원핵생물 고유 특성: 핵막 부재로 전사와 번역이 동시 진행 (Polysome)
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                인트론 없음 · 스플라이싱 생략
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              핵막에 의한 장벽이 없어 전사가 완료되기도 전에 여러 개의 70S 리보솜이 nascent mRNA에 즉각 달라붙어 동시다발적으로 번역을 수행합니다.
            </p>
          </div>
        )}

        {/* Visual Track 4: Interactive Ribosome Translation & tRNA Docking Simulation */}
        <div className="pt-2">
          <InteractiveTrnaTranslation
            mrnaSequence={activeMrnaForTranslation}
            residues={translationResult.residues}
            currentIndex={translationProgress}
            onTranslateSuccess={(newIdx) => {
              if (currentStage < 3) {
                setCurrentStage(3);
                setTranscriptionProgress(dnaCoding.length);
                setCapTailDone(true);
                setSplicingDone(true);
              }
              setTranslationProgress(newIdx);
              if (newIdx >= translationResult.residues.length) {
                setCurrentStage(4);
                setIsPlaying(false);
                playSound('success', soundEnabled);
              }
            }}
            onReset={() => {
              setTranslationProgress(0);
              setCurrentStage(3);
            }}
            soundEnabled={soundEnabled}
            isComplete={currentStage === 4 || translationProgress >= translationResult.residues.length}
          />
        </div>
      </div>
    </div>
  );
}
