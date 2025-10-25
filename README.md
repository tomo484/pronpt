# ImageContest - プロンプト競技Webアプリケーション

## 📖 概要

ImageContestは、AIを活用した画像生成プロンプトの精度を競うWebアプリケーションです。ユーザーは指定された目標画像に似た画像を生成するためのプロンプトを作成し、AIによって採点されます。

## 🎯 主な機能

### ユーザー向け機能
1. **ルーム一覧画面（ホーム画面）**
   - 複数のコンテストルームを一覧表示
   - 各ルームの指定画像をプレビュー
   - ルームのステータス表示（Open/Judging/Closed）
   - 参加者数と残り時間の表示

2. **コンテスト画面**
   - 目標となる指定画像の表示
   - プロンプト入力欄（最大1000文字）
   - 画像生成ボタン
   - リアルタイムでの画像生成

3. **結果画面**
   - 同じルームに参加している全ユーザーの生成画像と点数を表示
   - 作成順に並べられた投稿一覧
   - AIが生成した模範解答の表示
   - 類似度スコア（パーセンテージ）の表示
   - ソート・検索機能

### AI機能
1. **画像生成**
   - ユーザーのプロンプトから画像を生成（OpenAI DALL-E API）

2. **画像比較・採点**
   - 目標画像と生成画像を比較し、類似度を採点（OpenAI GPT-4 Vision API）

3. **模範解答生成**
   - 指定画像から最適なプロンプトを自動生成（ルーム作成時）

## 🛠️ 技術スタック

### フルスタック
- **Next.js 14+** (App Router + Route Handlers)
- **TypeScript**
- **Tailwind CSS** (スタイリング)
- **OpenAI API** (画像生成・画像比較・プロンプト生成)

### データベース
- **Supabase** (PostgreSQL)
- **Supabase Realtime** (リアルタイム更新)

### デプロイ
- **Vercel** (フロントエンド・バックエンド統合デプロイ)

### その他
- **pnpm** (パッケージマネージャー)

## 📁 プロジェクト構造

```
pronpt/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # ホーム画面
│   │   ├── contest/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # コンテスト画面
│   │   ├── results/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # 結果画面
│   │   ├── api/               # Route Handlers (バックエンドAPI)
│   │   │   ├── rooms/
│   │   │   │   ├── route.ts  # GET /api/rooms
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts  # GET /api/rooms/[id]
│   │   │   ├── submissions/
│   │   │   │   ├── route.ts  # POST /api/submissions
│   │   │   │   └── [roomId]/
│   │   │   │       └── route.ts  # GET /api/submissions/[roomId]
│   │   │   └── ai/
│   │   │       ├── generate-image/
│   │   │       │   └── route.ts
│   │   │       ├── compare-images/
│   │   │       │   └── route.ts
│   │   │       └── generate-prompt/
│   │   │           └── route.ts
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── globals.css        # グローバルスタイル
│   ├── components/            # 共通コンポーネント
│   │   ├── Layout.tsx
│   │   ├── RoomCard.tsx
│   │   ├── ImageDisplay.tsx
│   │   └── SubmissionCard.tsx
│   ├── lib/                   # ユーティリティ・サービス
│   │   ├── supabase.ts       # Supabaseクライアント
│   │   ├── openai.ts         # OpenAI API呼び出し
│   │   └── api.ts            # API呼び出しヘルパー
│   └── types/                 # TypeScript型定義
│       └── index.ts
├── public/                    # 静的ファイル
├── docs/
│   └── UI/                    # UIデザインファイル
│       ├── ui-1.html          # ホーム画面
│       ├── ui-2.html          # コンテスト画面
│       └── ui-3.html          # 結果画面
├── .env.local                 # 環境変数
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── README.md
└── TODO.md
```

## 🗄️ データベース設計

### テーブル構成

#### rooms（ルーム）
- `id` (UUID, Primary Key)
- `created_at` (TIMESTAMP) - 作成日時
- `title` (TEXT) - ルームタイトル
- `target_image_url` (TEXT) - 目標画像URL
- `model_prompt` (TEXT) - AIが生成した模範プロンプト
- `model_image_url` (TEXT) - 模範解答画像URL
- `status` (TEXT) - ステータス（open/closed）

#### users（投稿データ）
- `id` (UUID, Primary Key)
- `created_at` (TIMESTAMP) - 投稿日時
- `name` (TEXT) - ユーザー名
- `prompt` (TEXT) - ユーザーが入力したプロンプト
- `resultimage` (TEXT) - 生成された画像URL
- `similarity_score` (FLOAT) - 類似度スコア（0-100）
- `room_id` (UUID, Foreign Key -> rooms.id)

## 🔧 セットアップ

### 前提条件
- Node.js 18以上
- pnpm
- Supabaseアカウント
- OpenAI APIキー

### 環境変数設定

#### .env.local
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://picazsafdgbtnsohbyiu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### インストール・起動

```bash
# パッケージインストール
pnpm install

# 開発サーバー起動
pnpm dev
```

アプリケーションは http://localhost:3000 で起動します。

## 🚀 デプロイ

### Vercel（推奨）
Next.jsアプリケーション全体（フロントエンド + API Routes）をVercelにデプロイ

1. GitHubリポジトリに接続
2. 環境変数を設定
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
3. デプロイ実行

### データベース
- Supabase（既に設定済み）

## 📝 API仕様

### Next.js Route Handlers

#### ルーム関連
- `GET /api/rooms` - ルーム一覧取得
- `GET /api/rooms/[id]` - ルーム詳細取得
- `POST /api/rooms` - ルーム作成（管理者用）

#### 投稿関連
- `GET /api/submissions/[roomId]` - ルームの投稿一覧取得
- `POST /api/submissions` - 投稿作成

#### AI関連
- `POST /api/ai/generate-image` - 画像生成
  - Request: `{ prompt: string }`
  - Response: `{ imageUrl: string }`
- `POST /api/ai/compare-images` - 画像比較・採点
  - Request: `{ targetUrl: string, generatedUrl: string }`
  - Response: `{ score: number }`
- `POST /api/ai/generate-prompt` - プロンプト生成
  - Request: `{ imageUrl: string }`
  - Response: `{ prompt: string }`

## 🎨 デザインシステム

- **カラーパレット**
  - Primary: `#007BFF` / `#1313ec`
  - Background Light: `#F8F9FA` / `#f6f6f8`
  - Background Dark: `#101022` / `#111122`

- **フォント**
  - Space Grotesk

- **アイコン**
  - Material Symbols Outlined

## 📄 ライセンス

MIT License

## 👥 開発者

開発チーム

---

**Note**: このプロジェクトは開発中です。詳細な進捗状況は`TODO.md`を参照してください。

