'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { fetchRankings, submitScore, ScoreRanking } from '@/lib/supabase';
import { playSound } from './Header';
import { Trophy, Award, CheckCircle, XCircle, ArrowRight, RotateCcw, Send } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: '원핵생물과 진핵생물의 중심원리(Central Dogma)에 대한 설명으로 옳은 것은?',
    options: [
      '원핵생물은 핵막이 있어 전사와 번역이 공간적으로 분리된다.',
      '진핵생물은 pre-mRNA 가공 과정에서 인트론(Intron)이 제거된다.',
      '원핵생물은 80S 리보솜을 사용하여 단백질을 번역한다.',
      '진핵생물은 전사가 완료되기 전 리보솜이 결합하여 동시 번역된다.'
    ],
    correctAnswer: 1,
    explanation: '진핵생물은 전사 후 스플라이싱을 통해 비암호화 부위인 인트론을 제거하고 엑손을 연결합니다. 원핵생물은 핵막이 없어 전사와 번역이 동시 진행됩니다.'
  },
  {
    id: 2,
    question: 'DNA 코딩 가닥의 염기 서열이 5\'-ATG-3\'일 때, 전사된 mRNA의 코돈과 대응되는 tRNA 안티코돈의 짝은?',
    options: [
      'mRNA 코돈: 5\'-AUG-3\', tRNA 안티코돈: 3\'-UAC-5\'',
      'mRNA 코돈: 5\'-UAC-3\', tRNA 안티코돈: 3\'-AUG-5\'',
      'mRNA 코돈: 5\'-TAC-3\', tRNA 안티코돈: 3\'-AUG-5\'',
      'mRNA 코돈: 5\'-AUG-3\', tRNA 안티코돈: 3\'-AUG-5\''
    ],
    correctAnswer: 0,
    explanation: '코딩 가닥 5\'-ATG-3\'는 mRNA에서 T가 U로 바뀐 5\'-AUG-3\'가 되며, 상보적인 tRNA 안티코돈은 3\'-UAC-5\' (또는 5\'-CAU-3\')입니다.'
  },
  {
    id: 3,
    question: '헤모글로빈 유전자의 6번째 코돈에서 염기 하나가 치환되어 글루탐산이 발린으로 바뀐 돌연변이의 종류는?',
    options: [
      '동의(침묵) 돌연변이 (Silent mutation)',
      '미스센스 돌연변이 (Missense mutation)',
      '난센스 돌연변이 (Nonsense mutation)',
      '틀이동 돌연변이 (Frameshift mutation)'
    ],
    correctAnswer: 1,
    explanation: '염기 치환으로 인해 다른 아미노산(글루탐산 → 발린)으로 바뀌어 단백질 기능에 변화를 주는 변이를 미스센스 돌연변이라고 합니다.'
  },
  {
    id: 4,
    question: '진핵생물에서 전사된 전구체 RNA(pre-mRNA)의 5\' 말단과 3\' 말단에 일어나는 수식으로 옳은 것은?',
    options: [
      '5\' 말단에 폴리 A 꼬리, 3\' 말단에 7-메틸구아노신 캡',
      '5\' 말단에 7-메틸구아노신 캡, 3\' 말단에 폴리 A 꼬리',
      '양쪽 말단 모두 엑손 절단 처리',
      '말단 수식 없이 세포질로 즉시 이동'
    ],
    correctAnswer: 1,
    explanation: '진핵생물은 분해를 막고 번역 개시를 돕기 위해 5\' 말단에 7-메틸구아노신 캡을, 3\' 말단에 폴리 A 꼬리를 부착합니다.'
  },
  {
    id: 5,
    question: '다음 중 단백질 번역을 종결시키는 종결 코돈(Stop codon)에 해당하지 않는 것은?',
    options: [
      'UAA',
      'UAG',
      'UGA',
      'UGG'
    ],
    correctAnswer: 3,
    explanation: '종결 코돈은 UAA, UAG, UGA 3가지입니다. UGG는 아미노산 트립토판(Trp)을 지정하는 코돈입니다.'
  }
];

export default function QuizRankings({ soundEnabled }: { soundEnabled: boolean }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [nickname, setNickname] = useState('');
  const [rankings, setRankings] = useState<ScoreRanking[]>([]);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isLoadingRankings, setIsLoadingRankings] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    setIsLoadingRankings(true);
    try {
      const data = await fetchRankings();
      setRankings(data);
    } finally {
      setIsLoadingRankings(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: optionIndex });
    playSound('click', soundEnabled);
  };

  const calculateScore = () => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });
    return Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
  };

  const finishQuiz = () => {
    setIsSubmitted(true);
    playSound('success', soundEnabled);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    const finalScore = calculateScore();
    await submitScore({ nickname: nickname.trim(), score: finalScore });
    setScoreSubmitted(true);
    playSound('success', soundEnabled);
    await loadRankings();
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScoreSubmitted(false);
    playSound('click', soundEnabled);
  };

  const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];
  const finalScore = calculateScore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quiz Area (2 Columns) */}
      <div className="lg:col-span-2 win98-window p-4 rounded shadow-md border-2 border-white dark:border-slate-700 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-300 dark:border-slate-700 pb-3">
            <h2 className="text-base font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <Trophy className="text-amber-500" />
              중심원리 개념 확인 스피드 퀴즈 (5문항)
            </h2>
            <span className="text-xs font-mono bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded text-blue-800 dark:text-blue-300">
              문제 {currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}
            </span>
          </div>

          {!isSubmitted ? (
            <div className="mt-4 space-y-4">
              {/* Question Text */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-700 shadow-inner">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-relaxed">
                  Q{currentQ.id}. {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3 rounded text-xs transition border flex items-center justify-between ${
                      selectedAnswers[currentQuestionIndex] === idx
                        ? 'win98-btn-active bg-blue-600 text-white font-bold border-blue-700 shadow-inner'
                        : 'win98-btn text-gray-800 dark:text-gray-200 border-gray-300 dark:border-slate-700'
                    }`}
                  >
                    <span>
                      {idx + 1}. {opt}
                    </span>
                    {selectedAnswers[currentQuestionIndex] === idx && (
                      <span className="font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Result Screen */
            <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-700 shadow-inner space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-3xl">
                🏆
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                퀴즈 완료! 최종 점수: <span className="text-blue-600 dark:text-blue-400">{finalScore}점</span>
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                5문제 중 {Math.round((finalScore / 100) * 5)}문제를 맞히셨습니다.
              </p>

              {/* Submit to Supabase Leaderboard Form */}
              {!scoreSubmitted ? (
                <form onSubmit={handleScoreSubmit} className="max-w-xs mx-auto mt-4 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="닉네임 입력 (예: 생물천재)"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={12}
                      className="text-xs flex-1 px-3 py-2 border rounded bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-700 outline-none"
                    />
                    <button
                      type="submit"
                      className="win98-btn px-4 py-2 text-xs font-bold text-white bg-blue-600 flex items-center gap-1"
                    >
                      <Send size={12} />
                      <span>랭킹 등록</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ 리더보드에 점수가 성공적으로 등록되었습니다!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 pt-3 border-t border-gray-300 dark:border-slate-700 flex items-center justify-between">
          {!isSubmitted ? (
            <>
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="win98-btn px-3 py-1.5 text-xs font-bold disabled:opacity-40"
              >
                이전 문제
              </button>

              {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="win98-btn px-4 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1"
                >
                  <span>다음 문제</span>
                  <ArrowRight size={12} />
                </button>
              ) : (
                <button
                  onClick={finishQuiz}
                  className="win98-btn px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1"
                >
                  <span>채점 및 결과 보기</span>
                  <CheckCircle size={12} />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={resetQuiz}
              className="win98-btn px-4 py-1.5 text-xs font-bold flex items-center gap-1 mx-auto"
            >
              <RotateCcw size={12} />
              <span>퀴즈 다시 풀기</span>
            </button>
          )}
        </div>
      </div>

      {/* Supabase Leaderboard Panel (1 Column) */}
      <div className="win98-window p-4 rounded shadow-md border-2 border-white dark:border-slate-700 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-gray-300 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Award className="text-amber-500" />
              명예의 전당 (실시간 랭킹)
            </h3>
            <span className="text-[10px] text-gray-500">Supabase DB 연동</span>
          </div>

          <div className="mt-3 space-y-2 overflow-y-auto max-h-[360px]">
            {isLoadingRankings ? (
              <div className="text-xs text-gray-500 py-6 text-center">랭킹 불러오는 중...</div>
            ) : rankings.length === 0 ? (
              <div className="text-xs text-gray-500 py-6 text-center">아직 등록된 기록이 없습니다.</div>
            ) : (
              rankings.map((r, idx) => (
                <div
                  key={r.id || idx}
                  className={`p-2.5 rounded text-xs flex items-center justify-between border ${
                    idx === 0
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200 font-bold'
                      : idx === 1
                      ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 text-slate-800 dark:text-slate-200 font-semibold'
                      : idx === 2
                      ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 text-orange-900 dark:text-orange-200'
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-mono font-bold">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                    </span>
                    <span className="truncate max-w-[120px]">{r.nickname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {r.score}점
                    </span>
                    <span className="text-[10px] text-gray-400 hidden sm:inline">
                      {r.played_at.slice(5, 16)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-3 text-[10px] text-gray-500 text-center">
          * 퀴즈 완료 시 상위 20위 랭킹에 즉시 반영됩니다.
        </div>
      </div>
    </div>
  );
}
