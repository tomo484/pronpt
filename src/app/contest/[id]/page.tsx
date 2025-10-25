'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchRoom, createSubmission } from '@/lib/api';
import type { Room } from '@/types';

export default function ContestPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  async function loadRoom() {
    try {
      setLoading(true);
      const data = await fetchRoom(roomId);
      setRoom(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name.trim() || !prompt.trim()) {
      alert('名前とプロンプトを入力してください');
      return;
    }

    if (prompt.length > 1000) {
      alert('プロンプトは1000文字以内にしてください');
      return;
    }

    try {
      setSubmitting(true);
      const result = await createSubmission({
        room_id: roomId,
        name: name.trim(),
        prompt: prompt.trim(),
      });

      if (result.success) {
        router.push(`/results/${roomId}`);
      } else {
        alert(result.error || '投稿に失敗しました');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-red-500">{error || 'ルームが見つかりませんでした'}</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-center gap-3 p-4">
              <p className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72 text-center">
                {room.title}
              </p>
            </div>

            {/* Target Image */}
            <div className="flex w-full grow bg-background-light dark:bg-background-dark p-4 justify-center">
              <div className="w-full max-w-2xl gap-1 overflow-hidden bg-background-light dark:bg-background-dark aspect-[4/3] rounded-xl flex border border-gray-200 dark:border-[#333333]">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-lg flex-1"
                  style={{ backgroundImage: `url("${room.target_image_url}")` }}
                />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 px-4 py-3">
              {/* Name Input */}
              <label className="flex flex-col w-full max-w-2xl">
                <div className="flex justify-between items-center pb-2">
                  <p className="text-gray-900 dark:text-white text-base font-medium leading-normal">
                    Your Name
                  </p>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#1E1E1E] focus:border-primary dark:focus:border-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal"
                  placeholder="Enter your name..."
                  disabled={submitting}
                />
              </label>

              {/* Prompt Input */}
              <label className="flex flex-col w-full max-w-2xl">
                <div className="flex justify-between items-center pb-2">
                  <p className="text-gray-900 dark:text-white text-base font-medium leading-normal">
                    Prompt
                  </p>
                  <div className="relative group">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 cursor-pointer">
                      help
                    </span>
                  </div>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#1E1E1E] focus:border-primary dark:focus:border-primary min-h-36 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal"
                  placeholder="Describe the image in detail..."
                  disabled={submitting}
                />
                <p className="text-right text-gray-500 dark:text-gray-400 text-sm pt-1">
                  {prompt.length}/1000 characters
                </p>
              </label>

              {/* Submit Button */}
              <div className="flex px-4 py-3 justify-center w-full max-w-2xl">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-dark focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {submitting ? '生成中...' : 'Generate My Image'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

