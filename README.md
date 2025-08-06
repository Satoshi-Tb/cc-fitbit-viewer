# cc-fitbit-app

Fitbit データの可視化・管理を行う Next.js アプリケーションです。Cloudflare Workers で自動デプロイされ、カロリー・体重・食品ログの包括的な分析機能を提供します。

## 📱 主要機能

### 1. ダッシュボード

- 日次サマリーの表示（カロリー・体重・歩数）
- リアルタイムデータ更新
- 基準日選択機能

### 2. カロリー・体重トレンド分析

- **概要タブ**

  - 消費カロリーと摂取カロリーの時系列チャート
  - 体重推移の重ね合わせ表示（デュアル軸チャート）
  - 期間選択（1 週間/1 ヶ月）
  - 平均値サマリー（消費・摂取・差分カロリー）

- **食品詳細タブ** ⭐ NEW
  - 指定期間内の食品ログ一覧表示
  - 日付順ソート機能（降順/昇順切り替え）
  - 曜日付き日付表示
  - 食品データありの日のみ表示
  - 詳細モーダルでの食品詳細確認

### 3. 体重トレンド

- 体重・体脂肪率の時系列表示
- 拡張期間選択（1 週間〜1 年）
- Health Planet CSV 取り込み機能（開発環境限定）

### 4. 食品ログ詳細 ⭐ NEW

- **一覧表示**

  - 日付（曜日付き）、食品サマリー、合計カロリー
  - データ存在日のみ表示
  - 日付ソート機能

- **詳細モーダル**
  - 食事タイプ別グループ化（朝食、昼食、夕食など）
  - 各食事の小計カロリー表示
  - 1 日の合計カロリー
  - ドラッグ操作での移動可能
  - 食品名、摂取量、個別カロリー詳細

## 🛠 技術スタック

### フロントエンド

- **フレームワーク**: Next.js 14.2.31 (App Router)
- **言語**: TypeScript
- **UI**: React 18 + Tailwind CSS
- **チャート**: Recharts 3.1.0
- **状態管理**: Jotai（グローバル状態）
- **データフェッチ**: SWR + fetch API

### バックエンド・デプロイ

- **API**: Hono 4.8.12
- **デプロイ**: Cloudflare Workers (@opennextjs/cloudflare)
- **ビルド**: Wrangler 4.25.0
- **フォント**: Inter, Roboto Mono (Google Fonts)

### 外部 API 統合

- **Fitbit Web API**: 活動量、食事、体重データ

## 📁 プロジェクト構成

```
cc-fitbit-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (Hono)
│   │   │   └── fitbit/
│   │   │       ├── calories/  # カロリー・体重時系列API
│   │   │       ├── daily-summary/ # 日次サマリーAPI
│   │   │       ├── food-log/  # 食品ログAPI ⭐ NEW
│   │   │       ├── weight/    # 体重・体脂肪API
│   │   │       └── import/    # CSV取り込みAPI
│   │   ├── calories/          # トレンド分析ページ
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx          # ダッシュボード
│   ├── components/            # Reactコンポーネント
│   │   ├── CalorieChart.tsx  # デュアル軸チャート
│   │   ├── WeightTrendChart.tsx # 体重トレンドチャート
│   │   ├── FoodLogList.tsx   # 食品ログ一覧 ⭐ NEW
│   │   ├── FoodLogModal.tsx  # 食品詳細モーダル ⭐ NEW
│   │   ├── Dashboard.tsx     # ダッシュボード
│   │   ├── Navigation.tsx    # ナビゲーション
│   │   └── DateSelector.tsx  # 基準日選択
│   ├── hooks/                 # カスタムフック
│   │   ├── useCalorieData.ts
│   │   ├── useWeightData.ts
│   │   └── useFoodLogData.ts  # 食品ログ用フック ⭐ NEW
│   ├── lib/                   # ユーティリティ
│   │   └── fitbit.ts         # Fitbit API クライアント
│   ├── store/                 # Jotai状態管理
│   │   └── atoms.ts          # グローバル状態定義
│   └── types/                 # TypeScript型定義
├── wrangler.jsonc            # Cloudflare Workers設定
├── open-next.config.ts       # OpenNext Cloudflare設定
└── .github/workflows/        # GitHub Actions自動デプロイ
```

## 🔧 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# ESLintによるコード検証
npm run lint

# Cloudflareでのローカルプレビュー
npm run preview

# Cloudflareへのデプロイ
npm run deploy

# Cloudflare環境変数の型生成
npm run cf-typegen

# テスト実行
npm run test              # Jest単体テスト
npm run test:watch        # テストウォッチモード
npm run test:coverage     # カバレッジレポート
npm run test:e2e          # Playwright E2Eテスト
```

## 🚀 GitHub Actions 自動デプロイ

### トリガー

- main ブランチへのプッシュ
- main ブランチへのプルリクエスト
- 手動実行（workflow_dispatch）

### 必要なシークレット

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 実行環境

- Ubuntu Latest
- Node.js 20
- OpenNext Cloudflare 使用

## 📊 API エンドポイント

| エンドポイント                | 機能                 | メソッド |
| ----------------------------- | -------------------- | -------- |
| `/api/hello`                  | サンプル API         | GET      |
| `/api/fitbit/daily-summary`   | 日次サマリー         | GET      |
| `/api/fitbit/calories`        | カロリー・体重時系列 | GET      |
| `/api/fitbit/weight`          | 体重・体脂肪時系列   | GET      |
| `/api/fitbit/food-log`        | 食品ログ詳細 ⭐ NEW  | GET      |
| `/api/fitbit/import/validate` | CSV 検証             | POST     |
| `/api/fitbit/import/csv`      | CSV 取り込み         | POST     |

## ⭐ 最新の追加機能（食品ログ詳細）

### 食品ログ一覧

- 指定期間（週/月）の食品データを一覧表示
- 日付順ソート機能（降順/昇順切り替え）
- 曜日表示（例: 2025-08-06 (火)）
- 食品データありの日のみ表示
- 食品名のカンマ区切りサマリー表示

### 食品詳細モーダル

- 食事タイプ別グループ化（朝食、昼食、夕食、おやつ等）
- 各食事タイプの小計カロリー表示
- 1 日の合計カロリー表示
- ドラッグ操作での位置移動
- 食品名、摂取量、カロリー詳細

### 技術的改善

- SWR による効率的なデータキャッシュ
- TypeScript 完全対応

## 🧪 テスト戦略

### 単体テスト (Jest + React Testing Library)

- API Routes 動作テスト
- ビジネスロジックテスト

### E2E テスト (Playwright)

- ユーザーシナリオテスト
- ダッシュボード・トレンドグラフ・CSV 取り込みテスト

## 🔒 セキュリティ

- 環境変数による認証情報管理

## 🌟 パフォーマンス最適化

- **キャッシュ戦略**: SWR による適切なデータキャッシュ
- **バンドル最適化**: Next.js 自動最適化
- **CDN 配信**: Cloudflare Workers Edge 実行

## 📝 開発方針

- **品質保証**: 機能追加・修正時は必ずタイプチェック・ビルド・テスト実行
- **コード品質**: ESLint + Prettier による統一的なコードスタイル
- **TypeScript**: 完全な型安全性の確保
- **レスポンシブ**: モバイルファーストな UI 設計

## 🔧 開発フロー

1. フィーチャーブランチを作成
2. 変更を実装
3. テストを実行し、品質チェックをパス
4. プルリクエストを作成
5. 自動デプロイによる本番反映

## 🚀 デプロイ済みアプリ

**デプロイ先**: Cloudflare Workers

https://cc-fitbit-app.sulp91-fy.workers.dev
