# cc-fitbit-app

Cloudflare での Next.js アプリケーション自動デプロイ用のテンプレートアプリケーション

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
- `npm run lint` - ESLint によるコード検証
- `npm run preview` - Cloudflare でのローカルプレビュー
- `npm run deploy` - Cloudflare へのデプロイ
- `npm run cf-typegen` - Cloudflare 環境変数の型生成

### デプロイメント

このアプリケーションは`@opennextjs/cloudflare`を使用して Cloudflare Workers に自動デプロイできます。

#### GitHub Actions による自動デプロイ

- **ファイル**: `.github/workflows/deploy.yml`
- **トリガー**:
  - main ブランチへのプッシュ
  - main ブランチへのプルリクエスト
  - 手動実行（workflow_dispatch）
- **環境**: Ubuntu Latest, Node.js 20
- **ビルド**: OpenNext Cloudflare を使用
- **必要なシークレット**:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- **デプロイ先**: Cloudflare Pages（Wrangler v3 使用）

### フォント設定

- **Sans Serif**: Inter (Google Fonts)
- **Monospace**: Roboto Mono (Google Fonts)

### 主要な設定ファイル

- `wrangler.jsonc:3-5` - Cloudflare 互換性設定（nodejs_compat 有効）
- `next.config.mjs:6-7` - OpenNext Cloudflare 開発環境初期化
- `open-next.config.ts:1-3` - OpenNext Cloudflare 設定

### API エンドポイント

- `/api/hello` - サンプル API ルート（`src/app/api/hello/route.ts`）

## テスト戦略

### 技術スタック

- **単体テスト**: Jest + React Testing Library
- **E2E テスト**: Playwright
- **テスト実行**: Next.js 標準テスト設定

### テストコマンド

- `npm run test` - Jest による単体テスト実行
- `npm run test:watch` - テストのウォッチモード
- `npm run test:coverage` - カバレッジレポート生成
- `npm run test:e2e` - Playwright による E2E テスト実行
- `npm run test:e2e:ui` - Playwright の UI モードでテスト実行

### 単体テスト指針

- **対象**: React コンポーネント、API Routes、ユーティリティ関数
- **配置**: `__tests__`ディレクトリまたは`.test.ts/.spec.ts`ファイル
- **命名規則**: `ComponentName.test.tsx`、`utils.test.ts`
- **カバレッジ目標**: 80%以上
- **テスト種別**:
  - コンポーネントレンダリングテスト
  - ユーザーインタラクションテスト
  - API Routes の動作テスト
  - ビジネスロジックの単体テスト

### E2E テスト指針

- **対象**: ユーザーシナリオ、クリティカルパス
- **配置**: `tests/e2e`ディレクトリ
- **テストケース**:
  - ダッシュボードの表示・データ更新
  - トレンドグラフの期間選択・表示
  - Health Planet CSV 取り込み機能
  - エラーハンドリングシナリオ
- **ブラウザ**: Chromium

### テスト実装ルール

1. **AAA パターン**: Arrange（準備）、Act（実行）、Assert（検証）
2. **モック使用**: 外部 API 呼び出しは必ずモック化
3. **データ分離**: テストデータは本番データと完全分離
4. **非同期処理**: `waitFor`、`findBy`を使用した適切な待機
5. **アクセシビリティ**: `getByRole`、`getByLabelText`を優先使用
