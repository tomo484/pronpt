-- ImageContest データベースセットアップSQL
-- Supabaseダッシュボードの SQL Editor で実行してください

-- roomsテーブル作成
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  title TEXT NOT NULL,
  target_image_url TEXT NOT NULL,
  model_prompt TEXT,
  model_image_url TEXT,
  status TEXT DEFAULT 'open'
);

-- usersテーブル作成（投稿データ）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  resultimage TEXT NOT NULL,
  similarity_score FLOAT,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_users_room_id ON users(room_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- テストデータ投入
INSERT INTO rooms (title, target_image_url, model_prompt, model_image_url, status)
VALUES 
  (
    'Sunset Over Mountains',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'A breathtaking landscape of a serene sunset over a majestic mountain range, with the sun casting a warm, golden glow on the peaks.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'open'
  ),
  (
    'Neon City Night',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800',
    'A futuristic cyberpunk cityscape at night with neon lights, flying vehicles, and towering skyscrapers.',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800',
    'open'
  ),
  (
    'Enchanted Forest',
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=800',
    'A mystical forest with ancient trees, magical glowing mushrooms, and ethereal light filtering through the canopy.',
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=800',
    'open'
  );

