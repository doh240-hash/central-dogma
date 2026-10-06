// Central Dogma Core Genetic Code Engine & Biology Simulation Logic

export interface AminoAcid {
  code3: string;
  code1: string;
  nameKr: string;
  nameEn: string;
  property: 'hydrophobic' | 'polar' | 'basic' | 'acidic' | 'start' | 'stop';
  color: string;
}

export const CODON_TABLE: Record<string, AminoAcid> = {
  // U
  'UUU': { code3: 'Phe', code1: 'F', nameKr: '페닐알라닌', nameEn: 'Phenylalanine', property: 'hydrophobic', color: '#38bdf8' },
  'UUC': { code3: 'Phe', code1: 'F', nameKr: '페닐알라닌', nameEn: 'Phenylalanine', property: 'hydrophobic', color: '#38bdf8' },
  'UUA': { code3: 'Leu', code1: 'L', nameKr: '류신', nameEn: 'Leucine', property: 'hydrophobic', color: '#38bdf8' },
  'UUG': { code3: 'Leu', code1: 'L', nameKr: '류신', nameEn: 'Leucine', property: 'hydrophobic', color: '#38bdf8' },
  'UCU': { code3: 'Ser', code1: 'S', nameKr: '세린', nameEn: 'Serine', property: 'polar', color: '#34d399' },
  'UCC': { code3: 'Ser', code1: 'S', nameKr: '세린', nameEn: 'Serine', property: 'polar', color: '#34d399' },
  'UCA': { code3: 'Ser', code1: 'S', nameKr: '세린', nameEn: 'Serine', property: 'polar', color: '#34d399' },
  'UCG': { code3: 'Ser', code1: 'S', nameKr: '세린', nameEn: 'Serine', property: 'polar', color: '#34d399' },
  'UAU': { code3: 'Tyr', code1: 'Y', nameKr: '티로신', nameEn: 'Tyrosine', property: 'polar', color: '#34d399' },
  'UAC': { code3: 'Tyr', code1: 'Y', nameKr: '티로신', nameEn: 'Tyrosine', property: 'polar', color: '#34d399' },
  'UAA': { code3: 'STOP', code1: '*', nameKr: '종결 코돈 (Ochre)', nameEn: 'Stop', property: 'stop', color: '#ef4444' },
  'UAG': { code3: 'STOP', code1: '*', nameKr: '종결 코돈 (Amber)', nameEn: 'Stop', property: 'stop', color: '#ef4444' },
  'UGU': { code3: 'Cys', code1: 'C', nameKr: '시스테인', nameEn: 'Cysteine', property: 'polar', color: '#34d399' },
  'UGC': { code3: 'Cys', code1: 'C', nameKr: '시스테인', nameEn: 'Cysteine', property: 'polar', color: '#34d399' },
  'UGA': { code3: 'STOP', code1: '*', nameKr: '종결 코돈 (Opal)', nameEn: 'Stop', property: 'stop', color: '#ef4444' },
  'UGG': { code3: 'Trp', code1: 'W', nameKr: '트립토판', nameEn: 'Tryptophan', property: 'hydrophobic', color: '#38bdf8' },

  // C
  'CUU': { code3: 'Leu', code1: 'L', nameKr: '류신', nameEn: 'Leucine', property: 'hydrophobic', color: '#38bdf8' },
  'CUC': { code3: 'Leu', code1: 'L', nameKr: '류신', nameEn: 'Leucine', property: 'hydrophobic', color: '#38bdf8' },
  'CUA': { code3: 'Leu', code1: 'L', nameKr: '류신', nameEn: 'Leucine', property: 'hydrophobic', color: '#38bdf8' },
  'CUG': { code3: 'Leu', code1: 'L', nameKr: '류신', nameEn: 'Leucine', property: 'hydrophobic', color: '#38bdf8' },
  'CCU': { code3: 'Pro', code1: 'P', nameKr: '프롤린', nameEn: 'Proline', property: 'hydrophobic', color: '#38bdf8' },
  'CCC': { code3: 'Pro', code1: 'P', nameKr: '프롤린', nameEn: 'Proline', property: 'hydrophobic', color: '#38bdf8' },
  'CCA': { code3: 'Pro', code1: 'P', nameKr: '프롤린', nameEn: 'Proline', property: 'hydrophobic', color: '#38bdf8' },
  'CCG': { code3: 'Pro', code1: 'P', nameKr: '프롤린', nameEn: 'Proline', property: 'hydrophobic', color: '#38bdf8' },
  'CAU': { code3: 'His', code1: 'H', nameKr: '히스티딘', nameEn: 'Histidine', property: 'basic', color: '#a855f7' },
  'CAC': { code3: 'His', code1: 'H', nameKr: '히스티딘', nameEn: 'Histidine', property: 'basic', color: '#a855f7' },
  'CAA': { code3: 'Gln', code1: 'Q', nameKr: '글루타민', nameEn: 'Glutamine', property: 'polar', color: '#34d399' },
  'CAG': { code3: 'Gln', code1: 'Q', nameKr: '글루타민', nameEn: 'Glutamine', property: 'polar', color: '#34d399' },
  'CGU': { code3: 'Arg', code1: 'R', nameKr: '아르지닌', nameEn: 'Arginine', property: 'basic', color: '#a855f7' },
  'CGC': { code3: 'Arg', code1: 'R', nameKr: '아르지닌', nameEn: 'Arginine', property: 'basic', color: '#a855f7' },
  'CGA': { code3: 'Arg', code1: 'R', nameKr: '아르지닌', nameEn: 'Arginine', property: 'basic', color: '#a855f7' },
  'CGG': { code3: 'Arg', code1: 'R', nameKr: '아르지닌', nameEn: 'Arginine', property: 'basic', color: '#a855f7' },

  // A
  'AUU': { code3: 'Ile', code1: 'I', nameKr: '아이소류신', nameEn: 'Isoleucine', property: 'hydrophobic', color: '#38bdf8' },
  'AUC': { code3: 'Ile', code1: 'I', nameKr: '아이소류신', nameEn: 'Isoleucine', property: 'hydrophobic', color: '#38bdf8' },
  'AUA': { code3: 'Ile', code1: 'I', nameKr: '아이소류신', nameEn: 'Isoleucine', property: 'hydrophobic', color: '#38bdf8' },
  'AUG': { code3: 'Met', code1: 'M', nameKr: '메티오닌 (개시)', nameEn: 'Methionine (Start)', property: 'start', color: '#eab308' },
  'ACU': { code3: 'Thr', code1: 'T', nameKr: '트레오닌', nameEn: 'Threonine', property: 'polar', color: '#34d399' },
  'ACC': { code3: 'Thr', code1: 'T', nameKr: '트레오닌', nameEn: 'Threonine', property: 'polar', color: '#34d399' },
  'ACA': { code3: 'Thr', code1: 'T', nameKr: '트레오닌', nameEn: 'Threonine', property: 'polar', color: '#34d399' },
  'ACG': { code3: 'Thr', code1: 'T', nameKr: '트레오닌', nameEn: 'Threonine', property: 'polar', color: '#34d399' },
  'AAU': { code3: 'Asn', code1: 'N', nameKr: '아스파라진', nameEn: 'Asparagine', property: 'polar', color: '#34d399' },
  'AAC': { code3: 'Asn', code1: 'N', nameKr: '아스파라진', nameEn: 'Asparagine', property: 'polar', color: '#34d399' },
  'AAA': { code3: 'Lys', code1: 'K', nameKr: '라이신', nameEn: 'Lysine', property: 'basic', color: '#a855f7' },
  'AAG': { code3: 'Lys', code1: 'K', nameKr: '라이신', nameEn: 'Lysine', property: 'basic', color: '#a855f7' },
  'AGU': { code3: 'Ser', code1: 'S', nameKr: '세린', nameEn: 'Serine', property: 'polar', color: '#34d399' },
  'AGC': { code3: 'Ser', code1: 'S', nameKr: '세린', nameEn: 'Serine', property: 'polar', color: '#34d399' },
  'AGA': { code3: 'Arg', code1: 'R', nameKr: '아르지닌', nameEn: 'Arginine', property: 'basic', color: '#a855f7' },
  'AGG': { code3: 'Arg', code1: 'R', nameKr: '아르지닌', nameEn: 'Arginine', property: 'basic', color: '#a855f7' },

  // G
  'GUU': { code3: 'Val', code1: 'V', nameKr: '발린', nameEn: 'Valine', property: 'hydrophobic', color: '#38bdf8' },
  'GUC': { code3: 'Val', code1: 'V', nameKr: '발린', nameEn: 'Valine', property: 'hydrophobic', color: '#38bdf8' },
  'GUA': { code3: 'Val', code1: 'V', nameKr: '발린', nameEn: 'Valine', property: 'hydrophobic', color: '#38bdf8' },
  'GUG': { code3: 'Val', code1: 'V', nameKr: '발린', nameEn: 'Valine', property: 'hydrophobic', color: '#38bdf8' },
  'GCU': { code3: 'Ala', code1: 'A', nameKr: '알라닌', nameEn: 'Alanine', property: 'hydrophobic', color: '#38bdf8' },
  'GCC': { code3: 'Ala', code1: 'A', nameKr: '알라닌', nameEn: 'Alanine', property: 'hydrophobic', color: '#38bdf8' },
  'GCA': { code3: 'Ala', code1: 'A', nameKr: '알라닌', nameEn: 'Alanine', property: 'hydrophobic', color: '#38bdf8' },
  'GCG': { code3: 'Ala', code1: 'A', nameKr: '알라닌', nameEn: 'Alanine', property: 'hydrophobic', color: '#38bdf8' },
  'GAU': { code3: 'Asp', code1: 'D', nameKr: '아스파트산', nameEn: 'Aspartate', property: 'acidic', color: '#f43f5e' },
  'GAC': { code3: 'Asp', code1: 'D', nameKr: '아스파트산', nameEn: 'Aspartate', property: 'acidic', color: '#f43f5e' },
  'GAA': { code3: 'Glu', code1: 'E', nameKr: '글루탐산', nameEn: 'Glutamate', property: 'acidic', color: '#f43f5e' },
  'GAG': { code3: 'Glu', code1: 'E', nameKr: '글루탐산', nameEn: 'Glutamate', property: 'acidic', color: '#f43f5e' },
  'GGU': { code3: 'Gly', code1: 'G', nameKr: '글리신', nameEn: 'Glycine', property: 'hydrophobic', color: '#38bdf8' },
  'GGC': { code3: 'Gly', code1: 'G', nameKr: '글리신', nameEn: 'Glycine', property: 'hydrophobic', color: '#38bdf8' },
  'GGA': { code3: 'Gly', code1: 'G', nameKr: '글리신', nameEn: 'Glycine', property: 'hydrophobic', color: '#38bdf8' },
  'GGG': { code3: 'Gly', code1: 'G', nameKr: '글리신', nameEn: 'Glycine', property: 'hydrophobic', color: '#38bdf8' },
};

export interface TranslatedResidue {
  codon: string;
  anticodon: string;
  aminoAcid: AminoAcid;
  position: number;
}

export interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  dnaCodingStrand: string; // 5' to 3'
  intronRanges?: [number, number][]; // 0-indexed range [start, end)
  note: string;
}

export const PRESETS: SimulationPreset[] = [
  {
    id: 'standard',
    name: '표준 예제 유전자 (Normal Demo)',
    description: '개시 코돈(AUG)부터 종결 코돈(UAA)까지 완벽한 번역을 보여주는 표준 서열',
    dnaCodingStrand: 'ATGGCCATTGTAATGGGCCGCTGAAAGGGT',
    intronRanges: [[9, 15]],
    note: '기본적인 전사 및 번역 과정을 관찰하기 가장 적합한 모델 서열입니다.'
  },
  {
    id: 'sickle-cell',
    name: '헤모글로빈 베타사슬 & 낫적혈구 빈혈증',
    description: '6번째 아미노산 글루탐산(GAG)이 발린(GTG)으로 바뀌는 미스센스 돌연변이 모델',
    dnaCodingStrand: 'ATGGTGCACCTGACTCCTGAGGAGAAGTCT',
    note: 'GAG(글루탐산) -> GTG(발린) 변이로 인한 적혈구 낫모양 변형 기전을 학습합니다.'
  },
  {
    id: 'gfp-chromophore',
    name: 'GFP 녹색 형광 단백질 발색단 (Chromophore)',
    description: '해파리에서 유래한 형광단백질의 핵심 발색 삼원소(Thr-Tyr-Gly)',
    dnaCodingStrand: 'ATGACATACGGCAAACGTCTGAACTAA',
    note: 'Thr(ACC)-Tyr(UAU)-Gly(GGC) 아미노산이 자가 탈수 반응을 거쳐 빛을 방출합니다.'
  },
  {
    id: 'lac-operon',
    name: '원핵생물 락토오스 오페론 (Lac Operon)',
    description: '대장균(E. coli)의 폴리시스트로닉 구조 및 동시 전사-번역을 잘 보여주는 모델',
    dnaCodingStrand: 'ATGACCATGATTACGGATTCACTGGCCGTCGTTTTACAACGTCGTGACTGGGAAAACCCTGGCGTTACCCAACTTAATCGCCTTGCAGCACATCCCCCT',
    note: '원핵생물 고유의 인트론 부재 및 전사와 번역의 시공간적 결합을 관찰할 수 있습니다.'
  },
  {
    id: 'insulin-b',
    name: '인간 인슐린 B-체인 펩타이드',
    description: '혈당을 조절하는 인슐린의 B사슬 아미노산 서열 일부',
    dnaCodingStrand: 'ATGTTTGTGAACCAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGCCGG',
    intronRanges: [[18, 36]],
    note: '진핵생물 고유의 복잡한 스플라이싱 및 번역 후 변형 과정을 이해합니다.'
  }
];

// Helper functions for nucleic acids
export function getComplementaryDna(dna5to3: string): string {
  // Returns the template strand (3' to 5')
  const map: Record<string, string> = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };
  return dna5to3.toUpperCase().split('').map(b => map[b] || 'N').join('');
}

export function transcribeToRna(dnaCodingStrand5to3: string): string {
  // In coding strand (5' -> 3'), T becomes U in mRNA (5' -> 3')
  return dnaCodingStrand5to3.toUpperCase().replace(/T/g, 'U');
}

export function getAnticodon(codon: string): string {
  // Codon 5' -> 3', Anticodon pairs: A-U, U-A, G-C, C-G (shown antiparallel 3'->5')
  const map: Record<string, string> = { 'A': 'U', 'U': 'A', 'G': 'C', 'C': 'G' };
  return codon.toUpperCase().split('').map(b => map[b] || 'N').join('');
}

export function translateMrna(mrna5to3: string): {
  residues: TranslatedResidue[];
  untranslated5: string;
  codingSequence: string;
  untranslated3: string;
  hasStartCodon: boolean;
  hasStopCodon: boolean;
  stopReason?: string;
} {
  const cleanMrna = mrna5to3.toUpperCase().replace(/[^AUGC]/g, '');
  const startIndex = cleanMrna.indexOf('AUG');

  if (startIndex === -1) {
    return {
      residues: [],
      untranslated5: cleanMrna,
      codingSequence: '',
      untranslated3: '',
      hasStartCodon: false,
      hasStopCodon: false,
      stopReason: '개시 코돈(AUG)을 찾을 수 없습니다.'
    };
  }

  const untranslated5 = cleanMrna.slice(0, startIndex);
  const readingFrame = cleanMrna.slice(startIndex);
  const residues: TranslatedResidue[] = [];
  let stopIndex = -1;
  let hasStopCodon = false;

  for (let i = 0; i + 3 <= readingFrame.length; i += 3) {
    const codon = readingFrame.slice(i, i + 3);
    const aa = CODON_TABLE[codon] || {
      code3: '???',
      code1: '?',
      nameKr: '미확인',
      nameEn: 'Unknown',
      property: 'polar',
      color: '#94a3b8'
    };

    if (aa.property === 'stop') {
      residues.push({
        codon,
        anticodon: getAnticodon(codon),
        aminoAcid: aa,
        position: residues.length + 1
      });
      stopIndex = startIndex + i + 3;
      hasStopCodon = true;
      break;
    }

    residues.push({
      codon,
      anticodon: getAnticodon(codon),
      aminoAcid: aa,
      position: residues.length + 1
    });
  }

  const codingEnd = stopIndex !== -1 ? stopIndex : cleanMrna.length;
  const codingSequence = cleanMrna.slice(startIndex, codingEnd);
  const untranslated3 = cleanMrna.slice(codingEnd);

  return {
    residues,
    untranslated5,
    codingSequence,
    untranslated3,
    hasStartCodon: true,
    hasStopCodon,
    stopReason: hasStopCodon ? '정상 종결 코돈 도달' : '서열 끝 도달 (종결 코돈 미포함)'
  };
}

// Organism comparison data
export interface OrganismComparison {
  organism: 'prokaryote' | 'eukaryote';
  title: string;
  subtitle: string;
  characteristics: {
    feature: string;
    description: string;
    icon: string;
    impact: string;
  }[];
}

export const COMPARISONS: Record<'prokaryote' | 'eukaryote', OrganismComparison> = {
  prokaryote: {
    organism: 'prokaryote',
    title: '원핵생물 (Prokaryote - E. coli 등)',
    subtitle: '시공간적 결합 (Coupled Transcription & Translation)',
    characteristics: [
      {
        feature: '핵막 부재 (세포질 단일 공간)',
        description: '핵과 세포질의 구분이 없어 DNA 전사와 리보솜 번역이 동일한 세포질 내에서 실시간으로 일어납니다.',
        icon: 'CircleDot',
        impact: '극도로 빠른 단백질 생산 반응 속도 달성'
      },
      {
        feature: '동시 전사-번역 (Polysome 형성)',
        description: 'RNA 중합효소가 아직 전사를 끝내지 않은 nascent mRNA에 여러 개의 리보솜이 즉시 달라붙어 번역을 시작합니다.',
        icon: 'Layers',
        impact: '전사 완료를 기다리지 않고 다량의 펩타이드 합성'
      },
      {
        feature: 'RNA 가공 과정 없음 (No Splicing)',
        description: '인트론(Intron)이 거의 없으며, 5\' 캡(Cap)이나 3\' 폴리 A 꼬리(Poly-A tail) 부착 과정이 없습니다.',
        icon: 'Scissors',
        impact: '전사된 RNA 원본이 곧바로 성숙 mRNA로 기능'
      },
      {
        feature: '다유전자성 mRNA (Polycistronic)',
        description: '하나의 mRNA 분자에 여러 개의 독립적인 단백질을 코딩하는 오픈 리딩 프레임(ORF)이 포함될 수 있습니다 (예: 락토오스 오페론).',
        icon: 'Binary',
        impact: '관련 대사 효소들의 효율적인 동시 발현 조절'
      }
    ]
  },
  eukaryote: {
    organism: 'eukaryote',
    title: '진핵생물 (Eukaryote - 인체 세포, 효모 등)',
    subtitle: '시공간적 분리 및 정교한 전구체 RNA 가공 (Splicing & Processing)',
    characteristics: [
      {
        feature: '핵막에 의한 시공간적 분리',
        description: '전사는 핵(Nucleus) 내부에서 일어나고, 번역은 핵막 외부의 세포질(Cytoplasm) 리보솜에서 엄격히 분리되어 진행됩니다.',
        icon: 'BoxSelect',
        impact: '유전자 발현의 다단계 정밀 제어 및 품질 검증 가능'
      },
      {
        feature: '5\' Cap & 3\' Poly-A Tail 수식',
        description: '전사 직후 5\' 말단에 7-메틸구아노신 캡을 씌우고, 3\' 말단에 수백 개의 아데닌(Poly-A) 꼬리를 붙입니다.',
        icon: 'ShieldCheck',
        impact: 'mRNA의 분해 방지 및 핵 밖 수송 신호로 작용'
      },
      {
        feature: 'RNA 스플라이싱 (Splicing)',
        description: '스플라이소좀(Spliceosome) 복합체에 의해 비암호화 부위인 인트론(Intron)을 잘라내고 엑손(Exon)만을 이어 붙입니다.',
        icon: 'Scissors',
        impact: '선택적 스플라이싱(Alternative Splicing)으로 단일 유전자에서 다양한 단백질 변이체 생성'
      },
      {
        feature: '단일유전자성 mRNA (Monocistronic)',
        description: '하나의 mRNA 분자는 원칙적으로 단 하나의 단백질 폴리펩타이드만을 암호화합니다.',
        icon: 'FileText',
        impact: '단백질별 독립적이고 정교한 번역 개시 제어'
      }
    ]
  }
};
