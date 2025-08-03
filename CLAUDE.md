# cc-fitbit-app

CloudflareでのNext.jsアプリケーション自動デプロイ用のテンプレートアプリケーション

## アプリケーション構造

### 技術スタック
- **フレームワーク**: Next.js 14.2.31
- **言語**: TypeScript
- **UI**: React 18 + Tailwind CSS
- **デプロイ**: Cloudflare Workers (@opennextjs/cloudflare)
- **バンドラー**: Wrangler 4.25.0
- **その他**: Hono 4.8.12

### プロジェクト構成
```
cc-fitbit-app/
├── src/
│   └── app/                    # Next.js App Router
│       ├── api/               # API Routes
│       │   └── hello/         # サンプルAPIエンドポイント
│       ├── layout.tsx         # ルートレイアウト
│       ├── page.tsx          # ホームページ
│       ├── globals.css       # グローバルスタイル
│       └── favicon.ico
├── wrangler.jsonc            # Cloudflare Workers設定
├── open-next.config.ts       # OpenNext Cloudflare設定
├── next.config.mjs          # Next.js設定
├── tailwind.config.ts       # Tailwind CSS設定
└── package.json
```

### 利用可能なコマンド
- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバー起動
- `npm run lint` - ESLintによるコード検証
- `npm run preview` - Cloudflareでのローカルプレビュー
- `npm run deploy` - Cloudflareへのデプロイ
- `npm run cf-typegen` - Cloudflare環境変数の型生成

### デプロイメント
このアプリケーションは`@opennextjs/cloudflare`を使用してCloudflare Workersに自動デプロイできます。

#### GitHub Actions による自動デプロイ
- **ファイル**: `.github/workflows/deploy.yml`
- **トリガー**: 
  - mainブランチへのプッシュ
  - mainブランチへのプルリクエスト
  - 手動実行（workflow_dispatch）
- **環境**: Ubuntu Latest, Node.js 20
- **ビルド**: OpenNext Cloudflareを使用
- **必要なシークレット**:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- **デプロイ先**: Cloudflare Pages（Wrangler v3使用）

### フォント設定
- **Sans Serif**: Inter (Google Fonts)
- **Monospace**: Roboto Mono (Google Fonts)

### 主要な設定ファイル
- `wrangler.jsonc:3-5` - Cloudflare互換性設定（nodejs_compat有効）
- `next.config.mjs:6-7` - OpenNext Cloudflare開発環境初期化
- `open-next.config.ts:1-3` - OpenNext Cloudflare設定

### APIエンドポイント
- `/api/hello` - サンプルAPIルート（`src/app/api/hello/route.ts`）