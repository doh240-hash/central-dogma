'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CODON_TABLE,
  getComplementaryDna,
  transcribeToRna,
  translateMrna,
  PRESETS
} from '@/lib/geneticCode';
import { playSound } from './Header';
import {
  Bot,
  Send,
  Trash2,
  Key,
  X,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Info
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface ChatGptWindowProps {
  isOpen: boolean;
  onClose: () => void;
  isFloating?: boolean;
  currentDnaSequence?: string;
  organismMode?: 'eukaryote' | 'prokaryote';
  currentStage?: number;
  activeMutationNote?: string | null;
  soundEnabled?: boolean;
}

const PRESET_QUESTIONS = [
  '🧬 전사와 번역의 핵심 차이점을 쉽게 설명해줘',
  '🔍 현재 시뮬레이션 중인 DNA 서열을 번역하고 분석해줘',
  '⚠️ 낫적혈구 빈혈증(GAG→GTG) 미스센스 돌연변이의 원리는?',
  '✂️ 진핵생물 인트론 제거와 스플라이싱(Splicing)의 생물학적 의의',
  '🛑 종결 코돈(UAA, UAG, UGA)과 방출 인자(RF)의 작용 기전',
  '🦠 원핵생물 폴리솜(Polysome)과 동시 전사-번역의 특징',
];

export default function ChatGptWindow({
  isOpen,
  onClose,
  isFloating = false,
  currentDnaSequence = 'ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG',
  organismMode = 'eukaryote',
  currentStage = 0,
  activeMutationNote = null,
  soundEnabled = true,
}: ChatGptWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('central_dogma_chat_history');
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `안녕하세요! 센트럴도그마(중심원리) 분자생물학 전문 AI 튜터 **ChatGPT**입니다. 🧬\n\nDNA 이중나선 복제, RNA 전사, 진핵생물 스플라이싱 가공, 리보솜 번역, 돌연변이 메커니즘 등 궁금한 점을 언제든 질문해 주세요!\n\n💡 *아래의 추천 질문 칩을 누르시거나, 현재 가상 실험실에서 조작 중인 유전자 서열 분석을 요청하실 수 있습니다.*`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [savedApiKey, setSavedApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gpt-4o-mini' | 'gpt-4o' | 'bio-specialist'>('gpt-4o');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load API key from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('central_dogma_openai_key') || '';
      setSavedApiKey(storedKey);
      setApiKey(storedKey);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('central_dogma_chat_history', JSON.stringify(messages));
      } catch {
        // quota exceeded or SSR
      }
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    const trimmed = apiKey.trim();
    setSavedApiKey(trimmed);
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('central_dogma_openai_key', trimmed);
      } else {
        localStorage.removeItem('central_dogma_openai_key');
      }
    }
    setApiKeyModalOpen(false);
    playSound('success', soundEnabled);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playSound('click', soundEnabled);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('대화 기록을 모두 지우시겠습니까?')) {
      const reset: ChatMessage[] = [
        {
          id: 'msg-welcome-new',
          role: 'assistant',
          content: '대화 기록이 초기화되었습니다. 센트럴도그마에 대해 새로운 질문을 시작해 보세요! 🧬',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      setMessages(reset);
      playSound('click', soundEnabled);
    }
  };

  // Generate dynamic biology answer if no OpenAI API Key or offline
  const generateDomainBioResponse = (userPrompt: string): string => {
    const p = userPrompt.toLowerCase();

    // 1. Current sequence analysis request
    if (p.includes('현재') || p.includes('서열') || p.includes('지금') || p.includes('실험실')) {
      const cleanDna = currentDnaSequence.toUpperCase().replace(/[^ATGC]/g, '');
      const template = getComplementaryDna(cleanDna);
      const mrna = transcribeToRna(cleanDna);
      const translated = translateMrna(mrna);
      const peptides = translated.residues.map(r => `${r.aminoAcid.code3}(${r.aminoAcid.nameKr})`).join(' - ');

      let stageDesc = '1단계 (DNA 이중나선 준비)';
      if (currentStage === 1) stageDesc = '2단계 (RNA 중합효소 전사 진행 중)';
      if (currentStage === 2) stageDesc = organismMode === 'eukaryote' ? '3단계 (5\'Cap, Splicing, Poly-A 가공)' : '3단계 (원핵생물 가공 생략)';
      if (currentStage === 3) stageDesc = '4단계 (리보솜 번역 및 tRNA 도킹)';
      if (currentStage === 4) stageDesc = '5단계 (폴리펩타이드 합성 완료)';

      return `### 🔬 가상 실험실 현재 유전자 서열 분석 리포트

- **생물 체계 모드**: \`${organismMode === 'eukaryote' ? '진핵생물 (Eukaryote)' : '원핵생물 (Prokaryote)'}\`
- **시뮬레이션 현재 단계**: **${stageDesc}**
${activeMutationNote ? `- **적용된 돌연변이**: ⚠️ *${activeMutationNote}*\n` : ''}

#### 🧬 염기서열 추적:
1. **DNA 코딩 가닥 (5' → 3')**:
   \`${cleanDna}\`
2. **DNA 주형 가닥 (3' → 5')**:
   \`${template}\`
3. **전사된 mRNA (5' → 3')**:
   \`${mrna}\`
4. **합성된 아미노산 폴리펩타이드 사슬**:
   \`${peptides || '(아직 번역되지 않음)'}\`

#### 💡 핵심 고찰:
- **개시 코돈**: mRNA의 첫 번째 \`AUG\`에서 메티오닌(Met)으로부터 번역이 개시됩니다.
- **종결 여부**: \`${translated.hasStopCodon ? `종결 코돈(${translated.residues[translated.residues.length - 1]?.codon || '종결'})에 의해 정상 종료되었습니다.` : '종결 코돈에 도달하기 전 서열 끝까지 읽혔습니다.'}\`
- **생물학적 의의**: ${organismMode === 'eukaryote' ? '진핵생물은 핵 내에서 이 서열의 pre-mRNA를 합성한 뒤 스플라이싱과 5\'Cap/Poly-A 꼬리를 붙여 세포질로 수송합니다.' : '원핵생물은 핵막이 없으므로 전사가 완료되기도 전에 리보솜이 결합하여 동시 번역(Polysome)됩니다.'}`;
    }

    // 2. Sickle cell anemia / missense mutation
    if (p.includes('낫적혈구') || p.includes('미스센스') || p.includes('gag') || p.includes('gtg') || p.includes('헤모글로빈')) {
      return `### 🩸 낫적혈구 빈혈증(Sickle Cell Anemia)과 미스센스 돌연변이

낫적혈구 빈혈증은 분자유전학에서 **단 하나의 염기 치환(Point mutation)**이 개체의 형질에 얼마나 결정적인 변화를 주는지 보여주는 가장 대표적인 예시입니다.

#### 1. 분자 수준의 변이 기전
- **정상 헤모글로빈 $\\beta$-글로빈 유전자**:
  - DNA 코딩 가닥: \`...GAG...\` (mRNA: \`GAG\`)
  - 번역 아미노산: **글루탐산(Glutamic acid, Glu)**
  - 특징: 곁사슬에 음전하 카복실기를 가진 **친수성(극성) 아미노산**으로 수용액에 잘 용해됨.
- **돌연변이 $\\beta$-글로빈 유전자**:
  - DNA 코딩 가닥: \`...GTG...\` (mRNA: \`GUG\`) — 2번째 염기가 **A에서 T로 치환**
  - 번역 아미노산: **발린(Valine, Val)**
  - 특징: 곁사슬이 비극성 탄화수소로 이루어진 **소수성 아미노산**!

#### 2. 병태생리학적 결과
1. **소수성 상호작용에 의한 응집**: 산소 분압이 낮아지면 표면에 노출된 발린(소수성)끼리 물을 피해 뭉치면서 헤모글로빈 분자들이 긴 섬유상 고분자를 형성합니다.
2. **적혈구 변형**: 정상 원반형 적혈구가 딱딱한 낫(초승달) 모양으로 변형됩니다.
3. **혈관 폐색 및 용혈**: 모세혈관을 통과하지 못해 혈관을 막고 쉽게 파괴되어 심각한 빈혈과 조직 괴사를 유발합니다.

💡 *시뮬레이션 콘솔의 '돌연변이 시뮬레이션 → 미스센스' 버튼을 누르시면 이 염기 변화를 직접 실험하실 수 있습니다.*`;
    }

    // 3. Splicing & Intron/Exon
    if (p.includes('스플라이싱') || p.includes('인트론') || p.includes('엑손') || p.includes('가공') || p.includes('splicing')) {
      return `### ✂️ 진핵생물의 RNA 가공과 선택적 스플라이싱(Alternative Splicing)

원핵생물과 달리 진핵생물의 유전자는 단백질로 번역되는 부위와 비암호화 부위가 섞여 있는 **분절된 유전자(Split Gene)** 구조를 가집니다.

#### 1. 주요 구성 요소
- **엑손(Exon)**: 발현되는 부위(Expressed region)로, 성숙한 mRNA에 남아 단백질 아미노산을 지정합니다.
- **인트론(Intron)**: 개입 부위(Intervening region)로, 번역되지 않는 비암호화 서열이며 **스플라이소솜(Spliceosome)**에 의해 제거됩니다.

#### 2. 진핵생물 pre-mRNA 3대 가공 과정
1. **5' 캡핑(5' Cap)**: 7-메틸구아노신($m^7G$)을 5' 말단에 부착하여 핵산분해효소로부터 보호하고 리보솜 결합을 유도합니다.
2. **스플라이싱(Splicing)**: 인트론을 올가미(Lariat) 형태로 잘라내고 엑손들을 인산다이에스터 결합으로 이어 붙입니다.
3. **3' 폴리A 꼬리(Poly-A tail)**: 3' 말단에 100~250개의 아데닌 뉴클레오타이드를 추가하여 mRNA 안정성을 높이고 핵 밖 세포질 수송을 돕습니다.

#### 3. 생물학적 의의 (선택적 스플라이싱)
동일한 pre-mRNA 전사체라도 엑손을 어떤 조합으로 이어 붙이느냐에 따라 **하나의 유전자에서 서로 다른 여러 종류의 단백질 이소형(Isoform)**을 만들어낼 수 있습니다.
- 인간 유전자 수는 약 20,000~25,000개에 불과하지만, 100,000종 이상의 단백질이 생성될 수 있는 핵심 비결입니다!`;
    }

    // 4. Transcription vs Translation
    if (p.includes('전사') && (p.includes('번역') || p.includes('차이') || p.includes('비교'))) {
      return `### 🧬 전사(Transcription)와 번역(Translation)의 핵심 비교

중심원리(Central Dogma)는 유전정보가 **DNA → RNA → 단백질**로 단방향 전달되는 생명의 대원칙입니다.

| 비교 항목 | 전사 (Transcription) | 번역 (Translation) |
| :--- | :--- | :--- |
| **장소 (진핵)** | **핵(Nucleus)** 내부 | **세포질(Cytoplasm)**의 리보솜 |
| **장소 (원핵)** | 세포질 (핵막 없음) | 세포질 (전사와 동시 진행) |
| **주형 (Template)** | DNA 3' → 5' 주형 가닥 | 성숙 mRNA 5' → 3' 코돈 서열 |
| **주요 효소/기구** | **RNA 중합효소(RNA Polymerase)** | **리보솜(Ribosome)** & tRNA |
| **단량체 단위** | 리보뉴클레오타이드 (ATP, UTP, GTP, CTP) | 20종 아미노산 (Amino acids) |
| **결합 방식** | 인산다이에스터 결합 | 펩타이드 결합 (Peptide bond) |
| **최종 생성물** | mRNA (전령 RNA) | 폴리펩타이드 (단백질) |

#### 🔑 상보적 염기쌍 규칙의 차이:
- 전사 시 DNA 주형의 **A**에 대응하여 RNA에는 티민(T) 대신 **유라실(U)**이 합성됩니다.
- 번역 시 mRNA 코돈 3염기와 tRNA 안티코돈 3염기가 상보적으로 수소결합하여 특정 아미노산을 정확한 순서로 배열합니다.`;
    }

    // 5. Stop codons & Release factor
    if (p.includes('종결') || p.includes('stop') || p.includes('난센스') || p.includes('종결 코돈')) {
      return `### 🛑 종결 코돈(Stop Codon)과 번역 종결 메커니즘

유전 암호표의 64개 코돈 중 3개는 어떠한 아미노산도 지정하지 않는 **종결 코돈(Stop Codon)**입니다.

#### 1. 종결 코돈 3형제 (mRNA 기준 5' → 3')
1. **UAA** (오커, Ochre)
2. **UAG** (앰버, Amber)
3. **UGA** (오팔, Opal)

#### 2. 번역 종결 과정
- 리보솜의 A자리(Aminoacyl site)에 종결 코돈이 노출되면, 대응하는 tRNA가 결합하는 것이 아니라 **방출 인자(Release Factor, RF)**라는 단백질이 A자리에 결합합니다.
- 방출 인자는 펩티딜 전이효소(Peptidyl transferase) 중심을 자극하여, tRNA에 연결된 폴리펩타이드 말단에 물($H_2O$) 분자를 결합시켜 **에스터 결합을 가수분해**합니다.
- 결과적으로 합성된 폴리펩타이드 사슬이 떨어져 나가고, 리보솜 대단량체와 소단량체, mRNA가 모두 분리됩니다.

#### ⚠️ 난센스 돌연변이(Nonsense Mutation)와의 연관성:
서열 중간의 아미노산 지정 코돈이 단일 염기 치환으로 인해 조기 종결 코돈(예: UAA)으로 바뀌면, 단백질 합성이 중간에 강제 종료되어 불완전하고 비기능적인 절단 단백질이 만들어집니다.`;
    }

    // 6. Prokaryotes vs Eukaryotes / Polysome
    if (p.includes('원핵') || p.includes('진핵') || p.includes('폴리솜') || p.includes('polysome') || p.includes('동시')) {
      return `### 🦠 원핵생물 vs 진핵생물의 발현 차이 & 폴리솜(Polysome)

#### 1. 공간적/시간적 분리 여부
- **진핵생물 (Eukaryote)**:
  - **핵막**이 존재하여 핵 내에서 전사와 RNA 가공이 일어난 뒤, 완성된 성숙 mRNA만이 핵공을 통해 세포질로 나옵니다.
  - 전사와 번역이 시간적·공간적으로 완전히 **분리**되어 있습니다.
- **원핵생물 (Prokaryote)**:
  - **핵막이 없습니다.**
  - 따라서 DNA에서 RNA 중합효소가 mRNA를 전사해 나가는 동안, 아직 전사가 끝나지 않은 nascent mRNA의 5' 말단에 70S 리보솜이 즉시 달라붙어 **동시 전사-번역(Coupled Transcription-Translation)**이 발생합니다!

#### 2. 폴리솜(Polysome, 폴리리보솜)
- 하나의 mRNA 가닥에 여러 개의 리보솜이 연이어 결합하여 동일한 폴리펩타이드를 대량으로 빠르게 동시 합성하는 복합체입니다.
- 원핵생물은 이 기전 덕분에 환경 변화에 즉각 반응하여 극도로 빠른 번식 속도를 나타냅니다.

💡 *가상 실험실 상단의 생물 체계 모드를 '원핵생물'로 전환해 보시면, 인트론 가공 단계가 건너뛰어지고 전사와 번역이 유기적으로 연동되는 모습을 확인하실 수 있습니다.*`;
    }

    // Default intelligent biology tutor response
    return `### 🧬 중심원리(Central Dogma) AI 튜터 해설

질문해 주신 **"${userPrompt}"**에 대한 핵심 분자생물학적 답변입니다:

1. **분자유전학적 핵심 원리**:
   - 모든 생명체의 유전정보는 DNA의 4가지 염기(A, T, G, C)의 배열 순서로 암호화되어 있습니다.
   - 3개의 염기가 모여 1개의 아미노산을 지정하는 **3염기 조합(트리플렛 코드 / 코돈)**을 형성하며, 64개의 코돈 조합이 20종의 아미노산을 결정합니다.
   
2. **시뮬레이션과 연계된 실험 팁**:
   - **돌연변이 실험**: 상단의 [돌연변이 시뮬레이션] 툴바를 눌러 미스센스, 난센스, 동의(침묵), 틀이동 돌연변이가 아미노산 서열에 미치는 영향을 직접 시뮬레이션해 보세요.
   - **코돈 표 확인**: 우측 상단의 [코돈 표 보기]를 열어 64개 코돈과 상보적 안티코돈의 대응 관계를 확인하실 수 있습니다.

추가로 궁금한 특정 서열, 코돈 번역, 혹은 기출 문제 개념이 있으시다면 언제든 질문해 주세요! 💡`;
  };

  const [isVercelApiConnected, setIsVercelApiConnected] = useState<boolean | null>(null);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');
    playSound('click', soundEnabled);

    const userMsg: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const apiMessages = [
      {
        role: 'system',
        content: `너는 생명과학Ⅱ 및 분자생물학 교육 시뮬레이션 '센트럴도그마(Central Dogma)'의 친절하고 전문적인 AI 튜터 ChatGPT야.
고등학생과 대학생 학습자에게 DNA 복제, 전사, RNA 가공(스플라이싱, 5'Cap, Poly-A), 번역(코돈, 안티코돈, 리보솜, tRNA), 돌연변이(미스센스, 난센스, 침묵, 틀이동) 등을 명확하고 생생하게 설명해 줘.
현재 실험실 컨텍스트:
- 생물 모드: ${organismMode}
- 현재 DNA 코딩 서열: ${currentDnaSequence}
- 활성 돌연변이: ${activeMutationNote || '없음'}
- 시뮬레이션 진행 단계: ${currentStage}단계
학습자가 직관적으로 이해할 수 있도록 마크다운, 불릿 포인트, 코드 블록을 적절히 활용하여 한국어로 답변해 줘.`
      },
      ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: query }
    ];

    try {
      // 1. Vercel 서버의 /api/chat 호출 (버셀 환경변수 'CHATGPT_API' 사용)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.reply) {
        setIsVercelApiConnected(true);
        const botMsg: ChatMessage = {
          id: 'msg-gpt-' + Date.now(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
        playSound('step', soundEnabled);
        setIsLoading(false);
        return;
      }

      // 2. 만약 Vercel 환경변수 CHATGPT_API가 아직 설정되지 않았거나(NO_API_KEY), 에러 발생 시
      if (data.code === 'NO_API_KEY') {
        setIsVercelApiConnected(false);
        // 내장 고지능 분자생물학 엔진으로 자동 폴백 + 친절한 안내 메시지 추가
        const localBioReply = generateDomainBioResponse(query);
        const notice = `\n\n> 💡 **Vercel 연동 안내**: Vercel 대시보드(Settings → Environment Variables)에 환경변수 이름 \`CHATGPT_API\`로 OpenAI 키를 등록하시면 실시간 GPT-4o로 즉시 연동됩니다. (현재는 내장 분자생물학 엔진으로 안전하게 정상 답변되었습니다.)`;
        
        const botMsg: ChatMessage = {
          id: 'msg-gpt-' + Date.now(),
          role: 'assistant',
          content: localBioReply + notice,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
        playSound('step', soundEnabled);
      } else {
        // 기타 OpenAI API 에러 시
        const errDesc = data.error || `HTTP ${response.status}`;
        const localBioReply = generateDomainBioResponse(query);
        const botMsg: ChatMessage = {
          id: 'msg-gpt-' + Date.now(),
          role: 'assistant',
          content: `${localBioReply}\n\n> ⚠️ *OpenAI API 알림 (${errDesc}): 내장 분자생물학 엔진으로 답변되었습니다.*`,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err: unknown) {
      console.warn('API fetch failed, falling back to built-in bio engine:', err);
      const localBioReply = generateDomainBioResponse(query);
      const botMsg: ChatMessage = {
        id: 'msg-gpt-' + Date.now(),
        role: 'assistant',
        content: localBioReply,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render markdown-like elements (code blocks, bold, headers, tables)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-sm text-blue-900 dark:text-cyan-300 mt-2 mb-1 flex items-center gap-1.5">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} className="font-bold text-xs text-indigo-800 dark:text-indigo-300 mt-1.5 mb-0.5">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <div key={idx} className="p-2 my-1 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 text-[11px] text-amber-900 dark:text-amber-200 rounded-r">
            {line.replace('> ', '')}
          </div>
        );
      }
      // Table rows
      if (line.startsWith('|')) {
        return (
          <div key={idx} className="font-mono text-[11px] py-0.5 overflow-x-auto text-gray-800 dark:text-gray-200">
            {line}
          </div>
        );
      }
      // Bullet items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-gray-800 dark:text-gray-200 leading-relaxed my-0.5">
            {renderInlineCodeAndBold(bulletText)}
          </li>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="ml-2 text-xs text-gray-800 dark:text-gray-200 leading-relaxed my-0.5">
            {renderInlineCodeAndBold(line)}
          </div>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed my-0.5">
          {renderInlineCodeAndBold(line)}
        </p>
      );
    });
  };

  const renderInlineCodeAndBold = (text: string) => {
    // Basic regex replacer for `code` and **bold**
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 dark:bg-slate-900 text-emerald-400 font-mono text-[11px] font-bold border border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-gray-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-gray-700 dark:text-gray-300">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div
      className={
        isFloating
          ? `fixed z-50 transition-all duration-200 ${
              isMaximized
                ? 'inset-3 sm:inset-6'
                : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[460px] h-[580px] max-h-[85vh]'
            }`
          : 'w-full h-[680px]'
      }
    >
      <div className="win98-window w-full h-full flex flex-col rounded-sm overflow-hidden shadow-2xl border-2 border-white dark:border-slate-700">
        {/* Retro Windows 98 / ChatGPT Titlebar */}
        <div className="bg-gradient-to-r from-[#000080] via-[#0d6efd] to-[#10a37f] dark:from-[#0f172a] dark:via-[#1e3a8a] dark:to-[#10a37f] text-white px-3 py-1.5 flex items-center justify-between select-none shadow-sm">
          <div className="flex items-center gap-2">
            {/* OpenAI / ChatGPT Badge */}
            <div className="w-5 h-5 rounded bg-[#10a37f] flex items-center justify-center text-white font-bold text-xs shadow-inner">
              <Bot size={13} />
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-wide flex items-center gap-1.5 drop-shadow">
              ChatGPT (생명과학 AI 튜터)
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded border border-white/20 font-mono">
                {isVercelApiConnected ? 'GPT-4o (CHATGPT_API 연동)' : 'Vercel CHATGPT_API'}
              </span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* API Key Modal Button */}
            <button
              onClick={() => setApiKeyModalOpen(true)}
              title="Vercel 환경변수 CHATGPT_API 설정 가이드"
              className={`win98-btn px-1.5 h-6 flex items-center gap-1 text-[11px] font-bold ${
                isVercelApiConnected ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <Key size={11} />
              <span className="hidden sm:inline">CHATGPT_API 설정</span>
            </button>

            {/* Clear History Button */}
            <button
              onClick={handleClearHistory}
              title="대화 지우기"
              className="win98-btn w-6 h-6 flex items-center justify-center text-gray-800 dark:text-gray-200"
            >
              <Trash2 size={12} />
            </button>

            {/* Maximize Toggle */}
            {isFloating && (
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? '원래 크기로' : '최대화'}
                className="win98-btn w-6 h-6 flex items-center justify-center text-gray-800 dark:text-gray-200 text-[10px] font-bold"
              >
                {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              title="닫기"
              className="win98-btn w-6 h-6 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Vercel Environment Variable & API Information Modal */}
        {apiKeyModalOpen && (
          <div className="p-3 bg-amber-50 dark:bg-slate-800 border-b-2 border-amber-300 dark:border-slate-700 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between font-bold text-amber-900 dark:text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Key size={13} />
                Vercel 환경변수 &apos;CHATGPT_API&apos; 연동 가이드
              </span>
              <button onClick={() => setApiKeyModalOpen(false)} className="text-gray-500 font-bold hover:text-black">✕</button>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-gray-300 dark:border-slate-700 space-y-1 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-bold">환경변수 키(Key):</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-700">CHATGPT_API</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-bold">값(Value):</span>
                <span className="text-blue-700 dark:text-blue-400">sk-... (OpenAI Secret API Key)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-bold">설정 경로:</span>
                <span className="text-gray-700 dark:text-gray-300">Vercel Dashboard → Project → Settings → Environment Variables</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
              * Vercel에 <code className="font-bold text-emerald-600">CHATGPT_API</code> 환경변수를 추가하시면 <code className="font-bold text-blue-600">/api/chat</code> 백엔드 엔드포인트를 통해 실시간 GPT-4o로 안전하게 자동 연동됩니다. 환경변수 등록 전에도 내장 분자생물학 전문 엔진이 100% 무료로 동작합니다.
            </p>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[#ece9d8] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-[#10a37f] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-lg p-3 text-xs shadow-xs transition ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-gray-300 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75 font-mono">
                    <span className="font-bold">
                      {isUser ? '탐구자 (나)' : 'ChatGPT 4o'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="space-y-1">
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      renderFormattedContent(msg.content)
                    )}
                  </div>

                  {/* Copy Button */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      title="답변 복사하기"
                      className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition p-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-blue-600"
                    >
                      {copiedId === msg.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 text-xs font-bold font-mono">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center justify-start animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-[#10a37f] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={15} />
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg rounded-tl-none border border-gray-300 dark:border-slate-700 flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-medium animate-pulse">ChatGPT가 중심원리 분자 기전을 분석하고 있습니다...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 bg-[#d4d0c8] dark:bg-slate-900 border-t border-gray-300 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] select-none">
          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 shrink-0 flex items-center gap-1">
            <Sparkles size={11} className="text-amber-500" />
            추천:
          </span>
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="win98-btn px-2.5 py-0.5 rounded text-[11px] text-gray-800 dark:text-gray-200 hover:bg-white whitespace-nowrap shrink-0 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-2 sm:p-3 bg-[#c0c0c0] dark:bg-[#1e293b] border-t-2 border-white dark:border-slate-700 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400">
            <button
              onClick={() => handleSendMessage('현재 시뮬레이션 중인 DNA 서열을 번역하고 분석해줘')}
              disabled={isLoading}
              className="win98-btn px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-cyan-300 flex items-center gap-1"
            >
              <span>🔬 현재 DNA 서열 즉시 분석</span>
            </button>

            <span className="text-[10px] font-mono">
              Enter = 전송 | Shift+Enter = 줄바꿈
            </span>
          </div>

          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={2}
              placeholder="센트럴도그마나 돌연변이에 대해 무엇이든 질문하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 p-2 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded border border-gray-400 dark:border-slate-700 shadow-inner resize-none outline-none focus:border-blue-500"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className={`win98-btn px-3 py-3 h-[42px] flex items-center justify-center font-bold text-xs ${
                inputMessage.trim() && !isLoading
                  ? 'bg-blue-600 text-white font-black'
                  : 'text-gray-400'
              }`}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
