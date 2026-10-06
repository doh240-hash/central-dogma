'use client';

import React, { useState } from 'react';
import { COMPARISONS, OrganismComparison } from '@/lib/geneticCode';
import { CheckCircle2, AlertTriangle, Layers, Split, Clock, Cpu } from 'lucide-react';

export default function ComparisonGuide() {
  const [activeTab, setActiveTab] = useState<'both' | 'prokaryote' | 'eukaryote'>('both');

  const comparisonTable = [
    {
      criteria: '전사 및 번역 장소',
      prokaryote: '세포질 (단일 구획, 핵막 없음)',
      eukaryote: '전사: 핵(Nucleus) / 번역: 세포질(Cytoplasm)',
      detail: '진핵생물은 핵막에 의해 시공간적으로 엄격히 분리됨'
    },
    {
      criteria: '시간적 관계 (Coupling)',
      prokaryote: '동시 전사-번역 (Coupled Transcription & Translation)',
      eukaryote: '순차적 분리 진행 (전사 → 가공 → 세포질 이동 → 번역)',
      detail: '원핵생물은 mRNA 합성이 끝나기 전 리보솜이 결합하여 번역'
    },
    {
      criteria: '전사 후 가공 (RNA Processing)',
      prokaryote: '가공 없음 (전사된 원본 RNA가 곧바로 번역됨)',
      eukaryote: '5\' Cap 부착, 3\' Poly-A Tail 부착, RNA Splicing(인트론 제거)',
      detail: '스플라이소좀이 인트론을 올가미(Lariat) 구조로 제거'
    },
    {
      criteria: 'mRNA 구조 (Cistron)',
      prokaryote: '다유전자성 (Polycistronic - 1개 mRNA에 여러 단백질 정보)',
      eukaryote: '단일유전자성 (Monocistronic - 1개 mRNA당 1개 단백질)',
      detail: '원핵생물의 오페론(Operon) 시스템 구조'
    },
    {
      criteria: '리보솜 침강계수',
      prokaryote: '70S 리보솜 (50S 대단량체 + 30S 소단량체)',
      eukaryote: '80S 리보솜 (60S 대단량체 + 40S 소단량체)',
      detail: '항생제(스트렙토마이신, 클로람페니콜)의 원핵 70S 특이적 표적 원리'
    },
    {
      criteria: '개시 아미노산',
      prokaryote: '포밀메티오닌 (fMet - Formylmethionine)',
      eukaryote: '메티오닌 (Met - Methionine)',
      detail: '원핵생물은 변형된 메티오닌(fMet)으로 개시'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Window Header */}
      <div className="win98-window p-4 rounded shadow-md border-2 border-white dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-300 dark:border-slate-700 pb-3">
          <div>
            <h2 className="text-lg font-black flex items-center gap-2 text-blue-900 dark:text-blue-300">
              <Layers className="text-blue-600" />
              원핵생물 vs 진핵생물 중심원리(Central Dogma) 비교 교구
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              고교 생명과학Ⅱ 및 수능/내신 빈출 핵심 포인트: 전사-번역 시공간적 분리 및 RNA 가공 유무의 차이
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center gap-1 bg-gray-200 dark:bg-slate-800 p-1 rounded">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1 text-xs font-bold rounded transition ${
                activeTab === 'both' ? 'win98-btn-active bg-blue-700 text-white' : 'win98-btn text-gray-700 dark:text-gray-300'
              }`}
            >
              종합 비교 (모두 보기)
            </button>
            <button
              onClick={() => setActiveTab('prokaryote')}
              className={`px-3 py-1 text-xs font-bold rounded transition ${
                activeTab === 'prokaryote' ? 'win98-btn-active bg-emerald-700 text-white' : 'win98-btn text-gray-700 dark:text-gray-300'
              }`}
            >
              원핵생물 모델
            </button>
            <button
              onClick={() => setActiveTab('eukaryote')}
              className={`px-3 py-1 text-xs font-bold rounded transition ${
                activeTab === 'eukaryote' ? 'win98-btn-active bg-purple-700 text-white' : 'win98-btn text-gray-700 dark:text-gray-300'
              }`}
            >
              진핵생물 모델
            </button>
          </div>
        </div>

        {/* Visual Dual Schematic */}
        {(activeTab === 'both' || activeTab === 'prokaryote' || activeTab === 'eukaryote') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Prokaryote Card */}
            {(activeTab === 'both' || activeTab === 'prokaryote') && (
              <div className="neu-card p-4 border border-emerald-300/60 dark:border-emerald-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 led-green"></span>
                      원핵생물 (대장균 등 세균)
                    </span>
                    <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-mono">
                      핵막 없음 · 동시 전사-번역
                    </span>
                  </div>

                  {/* Retro Diagram Box */}
                  <div className="bg-slate-900 text-emerald-300 p-3 rounded font-mono text-xs border border-emerald-600/40 scanlines space-y-2">
                    <div className="text-[10px] text-gray-400">=== 원핵생물 전사·번역 동시 진행 다이어그램 ===</div>
                    <div className="p-2 bg-slate-950/80 rounded border border-emerald-500/30">
                      <div>DNA ───[RNA 중합효소]───► 전사 진행 중 (5&apos;→3&apos;)</div>
                      <div className="pl-8 text-cyan-400">│  └─ mRNA 가닥 생성 중</div>
                      <div className="pl-12 text-amber-400">├─ [70S 리보솜 ①] ──► 펩타이드 합성 중</div>
                      <div className="pl-12 text-amber-400">├─ [70S 리보솜 ②] ──► 폴리솜(Polysome) 형성</div>
                      <div className="pl-12 text-amber-400">└─ [70S 리보솜 ③] ──► 다량의 단백질 급속 생산!</div>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                    {COMPARISONS.prokaryote.characteristics.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-900 dark:text-emerald-200">{c.feature}:</strong>{' '}
                          {c.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Eukaryote Card */}
            {(activeTab === 'both' || activeTab === 'eukaryote') && (
              <div className="neu-card p-4 border border-purple-300/60 dark:border-purple-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-purple-800 dark:text-purple-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 led-blue"></span>
                      진핵생물 (인체 세포, 효모)
                    </span>
                    <span className="text-[11px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded font-mono">
                      핵막 존재 · 3단계 RNA 가공
                    </span>
                  </div>

                  {/* Retro Diagram Box */}
                  <div className="bg-slate-900 text-purple-300 p-3 rounded font-mono text-xs border border-purple-600/40 scanlines space-y-2">
                    <div className="text-[10px] text-gray-400">=== 진핵생물 단계별 구획 분리 다이어그램 ===</div>
                    <div className="p-2 bg-slate-950/80 rounded border border-purple-500/30">
                      <div className="text-blue-300">[핵 내부] DNA 전사 → pre-mRNA 생성</div>
                      <div className="pl-4 text-pink-400">├─ 5&apos; Cap 부착 + 3&apos; Poly-A 꼬리 부착</div>
                      <div className="pl-4 text-pink-400">└─ 스플라이싱: 인트론(비암호화) 제거, 엑손 연결</div>
                      <div className="text-yellow-400">──────► [핵공(Nuclear Pore) 통과 수송] ──────►</div>
                      <div className="text-emerald-300">[세포질] 성숙 mRNA + 80S 리보솜 결합 → 번역 개시</div>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                    {COMPARISONS.eukaryote.characteristics.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-purple-900 dark:text-purple-200">{c.feature}:</strong>{' '}
                          {c.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Comprehensive Comparison Table */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5">
            <Cpu size={16} className="text-indigo-600" />
            핵심 비교 분석 매트릭스 (수능/공무원 생명과학 총정리)
          </h3>

          <div className="overflow-x-auto rounded border border-gray-300 dark:border-slate-700 shadow-inner">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 font-bold border-b border-gray-300 dark:border-slate-700">
                <tr>
                  <th className="p-2.5 w-1/5">비교 기준</th>
                  <th className="p-2.5 w-2/5 text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
                    원핵생물 (대장균 등)
                  </th>
                  <th className="p-2.5 w-2/5 text-purple-800 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30">
                    진핵생물 (인체 등)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {comparisonTable.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="p-2.5 font-bold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-slate-800/40">
                      {row.criteria}
                    </td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">
                      <div>{row.prokaryote}</div>
                    </td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">
                      <div>{row.eukaryote}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
