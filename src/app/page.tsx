'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchRooms } from '@/lib/api';
import type { Room } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      setLoading(true);
      const data = await fetchRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-6xl flex-1 px-4">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-gray-800 px-10 py-4">
              <div className="flex items-center gap-4 text-gray-900 dark:text-white">
                <span className="material-symbols-outlined text-primary text-3xl">
                  photo_camera
                </span>
                <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">
                  ImageContest
                </h2>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 py-10">
              <div className="flex flex-wrap justify-between gap-6 px-4 md:px-10 mb-8">
                <div className="flex min-w-72 flex-col gap-3">
                  <p className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white">
                    Creative Arena
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-normal leading-normal">
                    Compete with others by creating prompts to generate images.
                  </p>
                </div>
              </div>

              {/* Room Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : rooms.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-gray-500 dark:text-gray-400">
                    ルームがありません
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-10">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => router.push(`/contest/${room.id}`)}
                      className="flex flex-col gap-4 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                    >
                      <div
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover"
                        style={{ backgroundImage: `url("${room.target_image_url}")` }}
                      />
                      <div className="p-4 flex flex-col gap-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {room.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              room.status === 'open'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}
                          >
                            {room.status === 'open' ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 px-10 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  © 2024 ImageContest. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

