'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchRoom, fetchSubmissions } from '@/lib/api';
import { supabaseClient } from '@/lib/supabase-client';
import type { Room, User } from '@/types';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [submissions, setSubmissions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  useEffect(() => {
    loadData();
    setupRealtimeSubscription();
  }, [roomId]);

  async function loadData() {
    try {
      setLoading(true);
      const [roomData, submissionsData] = await Promise.all([
        fetchRoom(roomId),
        fetchSubmissions(roomId),
      ]);
      setRoom(roomData);
      setSubmissions(submissionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  function setupRealtimeSubscription() {
    const channel = supabaseClient
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'users',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('New submission:', payload);
          setSubmissions((prev) => [...prev, payload.new as User]);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }

  function getScoreColor(score: number | null): string {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-500';
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111122]">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111122]">
        <div className="text-red-500">{error || 'ルームが見つかりませんでした'}</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#111122]">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#232348] px-4 sm:px-10 py-3">
              <div className="flex items-center gap-4 text-white">
                <button
                  onClick={() => router.push('/')}
                  className="size-6 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-3xl">arrow_back</span>
                </button>
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                  {room.title} Results
                </h2>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-col gap-8 p-4 sm:p-6">
              {/* Target Image */}
              <div className="flex flex-col gap-4">
                <h3 className="text-white text-xl font-bold">Target Image</h3>
                <div className="w-full gap-1 overflow-hidden bg-[#111122] aspect-[16/9] flex rounded-lg">
                  <div
                    className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-lg flex-1"
                    style={{ backgroundImage: `url("${room.target_image_url}")` }}
                  />
                </div>

                {/* Model Answer */}
                {room.model_prompt && (
                  <details
                    className="flex flex-col rounded-lg bg-[#232348] px-4 py-2 group"
                    open={showModelAnswer}
                    onToggle={(e) => setShowModelAnswer((e.target as HTMLDetailsElement).open)}
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
                      <p className="text-white text-sm font-medium leading-normal">
                        View Model Answer
                      </p>
                      <span className="material-symbols-outlined text-white group-open:rotate-180 transition-transform">
                        expand_more
                      </span>
                    </summary>
                    <p className="text-[#9292c9] text-sm font-normal leading-normal pb-2">
                      {room.model_prompt}
                    </p>
                  </details>
                )}
              </div>

              {/* User Entries */}
              <div className="flex flex-col gap-4">
                <h3 className="text-white text-xl font-bold">User Entries</h3>

                {submissions.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    まだ投稿がありません
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="p-0 @container"
                      >
                        <div className="flex flex-col items-stretch justify-start rounded-lg @xl:flex-row @xl:items-start shadow-[0_0_4px_rgba(0,0,0,0.1)] bg-[#191933] hover:bg-[#232348] transition-colors duration-300">
                          <div
                            className="w-full @xl:w-1/3 bg-center bg-no-repeat aspect-video @xl:aspect-square bg-cover rounded-t-lg @xl:rounded-l-lg @xl:rounded-tr-none"
                            style={{ backgroundImage: `url("${submission.resultimage}")` }}
                          />
                          <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-3 py-4 @xl:px-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold">
                                {submission.name.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                                {submission.name}
                              </p>
                            </div>
                            <p className="text-[#9292c9] text-base font-normal leading-normal">
                              Prompt: {submission.prompt}
                            </p>
                            <div className="flex items-end justify-between gap-4 mt-2">
                              <p className={`text-2xl font-bold ${getScoreColor(submission.similarity_score)}`}>
                                {submission.similarity_score !== null
                                  ? `${submission.similarity_score}% Match`
                                  : 'Scoring...'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

