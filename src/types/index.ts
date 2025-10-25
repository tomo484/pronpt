export interface Room {
  id: string;
  created_at: string;
  title: string;
  target_image_url: string;
  model_prompt: string | null;
  model_image_url: string | null;
  status: string;
}

export interface User {
  id: string;
  created_at: string;
  name: string;
  prompt: string;
  resultimage: string;
  similarity_score: number | null;
  room_id: string;
}

export interface CreateSubmissionRequest {
  room_id: string;
  name: string;
  prompt: string;
}

export interface CreateSubmissionResponse {
  success: boolean;
  data?: User;
  error?: string;
}

