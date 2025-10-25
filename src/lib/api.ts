import type { Room, User, CreateSubmissionRequest, CreateSubmissionResponse } from '@/types';

const API_BASE = '/api';

export async function fetchRooms(): Promise<Room[]> {
  const response = await fetch(`${API_BASE}/rooms`);
  if (!response.ok) {
    throw new Error('ルームの取得に失敗しました');
  }
  const json = await response.json();
  return json.data;
}

export async function fetchRoom(id: string): Promise<Room> {
  const response = await fetch(`${API_BASE}/rooms/${id}`);
  if (!response.ok) {
    throw new Error('ルームの取得に失敗しました');
  }
  const json = await response.json();
  return json.data;
}

export async function fetchSubmissions(roomId: string): Promise<User[]> {
  const response = await fetch(`${API_BASE}/submissions/${roomId}`);
  if (!response.ok) {
    throw new Error('投稿の取得に失敗しました');
  }
  const json = await response.json();
  return json.data;
}

export async function createSubmission(
  data: CreateSubmissionRequest
): Promise<CreateSubmissionResponse> {
  const response = await fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  
  if (!response.ok) {
    return {
      success: false,
      error: json.error || '投稿に失敗しました',
    };
  }

  return json;
}

