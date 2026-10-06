'use client';

import React, { useState, useEffect } from 'react';
import { fetchPosts, createPost, likePost, Post } from '@/lib/supabase';
import { playSound } from './Header';
import { MessageSquare, Heart, Plus, Send, Clock, User, Sparkles } from 'lucide-react';

export default function CommunityBoard({ soundEnabled }: { soundEnabled: boolean }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPosts();
      setPosts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        author: author.trim() || '익명 탐구자'
      });
      setTitle('');
      setContent('');
      setAuthor('');
      setIsModalOpen(false);
      playSound('success', soundEnabled);
      await loadPosts();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    playSound('click', soundEnabled);
    const newLikes = await likePost(id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: newLikes } : p));
  };

  return (
    <div className="space-y-4">
      {/* Board Header Window */}
      <div className="win98-window p-4 rounded shadow-md border-2 border-white dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-300 dark:border-slate-700 pb-3">
          <div>
            <h2 className="text-base font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <MessageSquare className="text-blue-600" />
              생명과학 탐구 포럼 & Q&A 게시판
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              중심원리 시뮬레이션 결과 공유 및 생명과학Ⅱ 질의응답 (Supabase Posts DB 실시간 연동)
            </p>
          </div>

          <button
            onClick={() => {
              setIsModalOpen(true);
              playSound('click', soundEnabled);
            }}
            className="win98-btn px-4 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>새 글 작성하기</span>
          </button>
        </div>

        {/* Posts List */}
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-gray-500">게시물을 불러오는 중입니다...</div>
          ) : posts.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">등록된 게시물이 없습니다. 첫 질문을 남겨보세요!</div>
          ) : (
            posts.map(post => (
              <div
                key={post.id}
                className="p-3.5 bg-white dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-700 shadow-xs hover:border-blue-400 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600">
                    {post.title}
                  </h3>
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:scale-105 transition"
                  >
                    <Heart size={12} className="fill-rose-500" />
                    <span className="font-mono font-bold">{post.likes}</span>
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{post.author}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{post.created_at?.slice(0, 10)}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                    #분자생물학 #질의응답
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="win98-window w-full max-w-lg rounded-sm overflow-hidden shadow-2xl border-2 border-white dark:border-slate-700">
            {/* Modal Titlebar */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-3 py-1.5 flex items-center justify-between select-none">
              <span className="font-bold text-xs sm:text-sm">📝 탐구 토론방 글 작성 (새 질문/탐구 후기)</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="win98-btn w-6 h-6 flex items-center justify-center text-black dark:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePost} className="p-4 bg-[#ece9d8] dark:bg-slate-900 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  작성자 닉네임:
                </label>
                <input
                  type="text"
                  placeholder="예: 생명과학교사, 바이오탐구자"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-400 dark:border-slate-700 rounded outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  제목:
                </label>
                <input
                  type="text"
                  required
                  placeholder="질문 또는 공유할 실험 내용을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-400 dark:border-slate-700 rounded outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  내용:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="상세한 질문이나 탐구 관찰 내용을 작성하세요..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-400 dark:border-slate-700 rounded outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="win98-btn px-4 py-1.5 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="win98-btn px-5 py-1.5 font-bold text-white bg-blue-600 disabled:opacity-50 flex items-center gap-1"
                >
                  <Send size={12} />
                  <span>{isSubmitting ? '등록 중...' : '게시하기'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
