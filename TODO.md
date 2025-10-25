# ImageContest 開発TODO

## 🎯 MVP（最小実用版）- Phase 1-3 Minimal

このフェーズを完了すれば、**dev環境で3画面すべてが動作する試作品**が完成します！

---

## Phase 1: プロジェクトセットアップ 🔧

### 1.1 Next.jsプロジェクト初期化
- [ ] Next.js (App Router) プロジェクト作成
  ```bash
  pnpm create next-app@latest . --typescript --tailwind --app --src-dir
  ```
  
- [ ] 必要なパッケージインストール
  ```bash
  pnpm add @supabase/supabase-js openai
  ```

### 1.2 環境変数設定
- [ ] `.env.local` 作成（envファイルから値をコピー）
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://picazsafdgbtnsohbyiu.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  OPENAI_API_KEY=sk-...
  ```

### 1.3 データベース構築
- [ ] Supabaseダッシュボードで以下のSQLを実行

```sql
-- roomsテーブル
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  title TEXT NOT NULL,
  target_image_url TEXT NOT NULL,
  model_prompt TEXT,
  model_image_url TEXT,
  status TEXT DEFAULT 'open'
);

-- usersテーブル（投稿データ）
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  resultimage TEXT NOT NULL,
  similarity_score FLOAT,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_users_room_id ON users(room_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE users;
```

- [ ] テストデータ投入（1件でOK）
```sql
INSERT INTO rooms (title, target_image_url, model_prompt, model_image_url)
VALUES (
  'Sunset Over Mountains',
  'https://example.com/sunset.jpg',
  'A breathtaking sunset over majestic mountains',
  'https://example.com/model.jpg'
);
```

---

## Phase 2: バックエンド開発（API Routes） 🔧

### 2.1 共通ライブラリ作成

- [ ] `src/types/index.ts` - 型定義
```typescript
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
```

- [ ] `src/lib/supabase.ts` - Supabaseクライアント
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

- [ ] `src/lib/openai.ts` - OpenAI関数
  - [ ] `generateImage(prompt: string)` - 画像生成
  - [ ] `compareImages(targetUrl: string, generatedUrl: string)` - 類似度採点
  - [ ] `generatePromptFromImage(imageUrl: string)` - プロンプト生成

### 2.2 APIエンドポイント（最小限）

- [ ] `src/app/api/rooms/route.ts`
  - [ ] GET: ルーム一覧取得（シンプルに全件取得）

- [ ] `src/app/api/rooms/[id]/route.ts`
  - [ ] GET: ルーム詳細取得

- [ ] `src/app/api/submissions/route.ts`
  - [ ] POST: 投稿作成（画像生成 + 採点 + DB保存を一括処理）

- [ ] `src/app/api/submissions/[roomId]/route.ts`
  - [ ] GET: ルームの投稿一覧取得

---

## Phase 3: フロントエンド開発 ⚛️

### 3.1 基本設定

- [ ] `src/app/layout.tsx` - ルートレイアウト
  - [ ] Space Groteskフォント設定
  - [ ] 基本的なメタデータ

- [ ] `tailwind.config.ts` - カスタムカラー設定
```typescript
colors: {
  primary: '#1313ec',
  'background-light': '#f6f6f8',
  'background-dark': '#111122',
}
```

### 3.2 ページ実装（最小限）

#### ホーム画面 (src/app/page.tsx)
- [ ] ui-1.htmlをベースに実装
- [ ] ルーム一覧を取得して表示
- [ ] ルームカードクリック → `/contest/[id]` へ遷移
- [ ] **検索・フィルターは後回し**

#### コンテスト画面 (src/app/contest/[id]/page.tsx)
- [ ] ui-2.htmlをベースに実装
- [ ] ルーム情報取得・目標画像表示
- [ ] プロンプト入力欄（文字数カウント付き）
- [ ] 送信ボタン → 投稿API呼び出し
- [ ] ローディング表示
- [ ] 完了後 → `/results/[id]` へ遷移

#### 結果画面 (src/app/results/[id]/page.tsx)
- [ ] ui-3.htmlをベースに実装
- [ ] ルーム情報・目標画像表示
- [ ] 模範解答表示（アコーディオン）
- [ ] 投稿一覧表示（作成順）
- [ ] Supabase Realtimeで自動更新
- [ ] **ソート・検索は後回し**

### 3.3 クライアントサイドユーティリティ

- [ ] `src/lib/api.ts` - API呼び出し関数
```typescript
export async function fetchRooms() { ... }
export async function fetchRoom(id: string) { ... }
export async function fetchSubmissions(roomId: string) { ... }
export async function createSubmission(data: any) { ... }
```

---

## ✅ MVP完成チェックリスト

Phase 1-3を完了すると、以下が動作します:

- [ ] ホーム画面でルーム一覧が表示される
- [ ] ルームをクリックするとコンテスト画面に遷移
- [ ] プロンプトを入力して送信すると画像が生成される
- [ ] 結果画面で自分と他の人の投稿が見れる
- [ ] リアルタイムで新しい投稿が表示される

**🎉 ここまでで試作品完成！**

---

## Phase 4: 機能拡張（MVP後） 🚀

### 4.1 ホーム画面の機能追加
- [ ] 検索機能
- [ ] フィルター機能（ステータス別）
- [ ] ソート機能（新着順・人気順）

### 4.2 結果画面の機能追加
- [ ] スコアでソート
- [ ] ユーザー名で検索
- [ ] スコア色分け（緑・オレンジ・赤）

### 4.3 UI/UX改善
- [ ] ダークモード対応
- [ ] レスポンシブデザイン最適化
- [ ] アニメーション追加
- [ ] エラーメッセージ改善

### 4.4 管理機能
- [ ] ルーム作成画面（管理者用）
  - [ ] 画像URL入力
  - [ ] タイトル入力
  - [ ] 模範解答自動生成
- [ ] ルーム管理画面
  - [ ] ステータス変更
  - [ ] ルーム削除

---

## Phase 5: 最適化・セキュリティ 🔐

### 5.1 パフォーマンス最適化
- [ ] 画像最適化（Next.js Image）
- [ ] API応答キャッシング
- [ ] コード分割・遅延ロード

### 5.2 セキュリティ
- [ ] レート制限
- [ ] 入力サニタイゼーション
- [ ] CORS設定

---

## Phase 6: デプロイ 🚀

### 6.1 Vercelデプロイ
- [ ] GitHubリポジトリ作成
- [ ] Vercel接続
- [ ] 環境変数設定
- [ ] デプロイ実行

---

## 進捗管理

### 現在のフェーズ
**Phase 1: プロジェクトセットアップ** 🔴

### タイムライン目安
- **Phase 1**: 30分
- **Phase 2**: 2-3時間
- **Phase 3**: 3-4時間
- **合計**: 約6-8時間で試作品完成 🎯

### 技術スタック
- Next.js 14+ (App Router + Route Handlers)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- OpenAI API (DALL-E 3 + GPT-4 Vision)
- Vercel (デプロイ)

---

**最終更新日**: 2025-10-25
