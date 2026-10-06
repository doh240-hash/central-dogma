import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey.length > 10
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  likes: number;
}

export interface ScoreRanking {
  id: string;
  nickname: string;
  score: number;
  played_at: string;
}

// Initial rich sample data
const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    title: '진핵생물에서 선택적 스플라이싱의 생물학적 의의',
    content: '하나의 pre-mRNA에서 인트론과 엑손의 조합 방식에 따라 다양한 단백질 이소형(Isoform)이 생성될 수 있다는 점이 정말 경이롭습니다. 인간의 유전자 수가 2만~2만5천 개에 불과함에도 10만 종 이상의 단백질이 만들어지는 이유를 시뮬레이션을 통해 직접 체감했네요!',
    author: '생명과학교사_김연구',
    created_at: '2026-10-06T09:30:00Z',
    likes: 18,
  },
  {
    id: 'post-2',
    title: '낫적혈구 빈혈증 염기 하나 변이(GAG -> GTG) 실험 후기',
    content: 'DNA 6번째 코돈에서 T 하나가 바뀌었을 뿐인데 글루탐산(음전하 친수성)에서 발린(소수성)으로 바뀌고, 헤모글로빈이 섬유상으로 뭉쳐 적혈구가 낫 모양이 되는 과정이 한눈에 보입니다. 수업 시연용으로 강력 추천합니다.',
    author: '고3수험생_바이오러버',
    created_at: '2026-10-06T10:15:00Z',
    likes: 24,
  },
  {
    id: 'post-3',
    title: '원핵생물 폴리솜(Polysome)과 동시 전사-번역의 경이로움',
    content: '핵막이 없어서 전사가 끝나기도 전에 리보솜들이 주렁주렁 매달려 단백질을 뿜어내는 구조를 보고 세균의 무서운 증식 속도가 이해되었습니다. 스큐어모피즘 그래픽 덕분에 직관적입니다!',
    author: '생물동아리_부장',
    created_at: '2026-10-06T11:40:00Z',
    likes: 15,
  }
];

const MOCK_RANKINGS: ScoreRanking[] = [
  { id: 'rank-1', nickname: '센트럴도그마_마스터', score: 100, played_at: '2026-10-06 14:20' },
  { id: 'rank-2', nickname: 'RNA중합효소_장인', score: 95, played_at: '2026-10-06 15:10' },
  { id: 'rank-3', nickname: '리보솜50S대단량체', score: 90, played_at: '2026-10-06 16:05' },
  { id: 'rank-4', nickname: '인트론킬러', score: 85, played_at: '2026-10-06 16:50' },
  { id: 'rank-5', nickname: '코돈테이블암기왕', score: 80, played_at: '2026-10-06 17:35' },
];

const POSTS_KEY = 'central_dogma_posts_local';
const RANKINGS_KEY = 'central_dogma_rankings_local';

function getLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalData<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

export async function fetchPosts(): Promise<Post[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Post[];
    } catch (err) {
      console.warn('Supabase fetchPosts failed, falling back to mock:', err);
    }
  }
  return getLocalData<Post[]>(POSTS_KEY, MOCK_POSTS);
}

export async function createPost(newPost: { title: string; content: string; author: string }): Promise<Post> {
  const item: Post = {
    id: 'post-' + Date.now(),
    title: newPost.title,
    content: newPost.content,
    author: newPost.author || '익명 탐구자',
    created_at: new Date().toISOString(),
    likes: 0
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([item])
        .select()
        .single();
      if (!error && data) return data as Post;
    } catch (err) {
      console.warn('Supabase insert post failed, saving locally:', err);
    }
  }

  const current = getLocalData<Post[]>(POSTS_KEY, MOCK_POSTS);
  const updated = [item, ...current];
  setLocalData(POSTS_KEY, updated);
  return item;
}

export async function likePost(id: string): Promise<number> {
  if (supabase) {
    try {
      const { data } = await supabase.from('posts').select('likes').eq('id', id).single();
      const newCount = (data?.likes || 0) + 1;
      await supabase.from('posts').update({ likes: newCount }).eq('id', id);
      return newCount;
    } catch (err) {
      console.warn('Supabase like update failed, fallback to local:', err);
    }
  }

  const current = getLocalData<Post[]>(POSTS_KEY, MOCK_POSTS);
  const target = current.find(p => p.id === id);
  if (target) {
    target.likes += 1;
    setLocalData(POSTS_KEY, current);
    return target.likes;
  }
  return 1;
}

export async function fetchRankings(): Promise<ScoreRanking[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('score_rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(20);
      if (!error && data && data.length > 0) return data as ScoreRanking[];
    } catch (err) {
      console.warn('Supabase fetchRankings failed, falling back to mock:', err);
    }
  }
  return getLocalData<ScoreRanking[]>(RANKINGS_KEY, MOCK_RANKINGS);
}

export async function submitScore(entry: { nickname: string; score: number }): Promise<ScoreRanking> {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const item: ScoreRanking = {
    id: 'rank-' + Date.now(),
    nickname: entry.nickname || '익명 참가자',
    score: entry.score,
    played_at: dateStr
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('score_rankings')
        .insert([item])
        .select()
        .single();
      if (!error && data) return data as ScoreRanking;
    } catch (err) {
      console.warn('Supabase submitScore failed, saving locally:', err);
    }
  }

  const current = getLocalData<ScoreRanking[]>(RANKINGS_KEY, MOCK_RANKINGS);
  const updated = [...current, item].sort((a, b) => b.score - a.score).slice(0, 20);
  setLocalData(RANKINGS_KEY, updated);
  return item;
}
