# cc-fitbit-app

Cloudflare での Next.js アプリケーション自動デプロイ用のテンプレートアプリケーション

## アプリケーション構造

### 技術スタック

- **フレームワーク**: Next.js 14.2.31
- **言語**: TypeScript
- **UI**: React 18 + Tailwind CSS
- **チャート**: Recharts 3.1.0（データ可視化）
- **デプロイ**: Cloudflare Workers (@opennextjs/cloudflare)
- **バンドラー**: Wrangler 4.25.0
- **データフェッチ**: SWR + fetch API
- **状態管理**: Jotai（グローバル状態）
- **その他**: Hono 4.8.12

### プロジェクト構成

```
cc-fitbit-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (Hono)
│   │   │   ├── fitbit/        # Fitbit API統合
│   │   │   │   ├── calories/  # カロリーと体重データ API
│   │   │   │   └── daily-summary/ # 日次サマリー API
│   │   │   └── hello/         # サンプルAPIエンドポイント
│   │   ├── calories/          # カロリー可視化ページ
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── page.tsx          # ホームページ
│   │   ├── globals.css       # グローバルスタイル
│   │   └── favicon.ico
│   ├── components/            # Reactコンポーネント
│   │   ├── CalorieChart.tsx  # デュアル軸チャート（カロリー+体重）
│   │   └── PeriodSelector.tsx # 期間選択UI
│   ├── hooks/                 # カスタムフック
│   ├── lib/                   # ユーティリティ
│   │   └── fitbit.ts         # Fitbit API クライアント
│   └── types/                 # TypeScript型定義
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
- `/api/fitbit/daily-summary` - Fitbit 日次サマリー API（Hono）
- `/api/fitbit/calories` - カロリー・体重時系列データ API（Hono）

### 実装済み機能

#### カロリー・体重可視化機能

- **ページURL**: `/calories`
- **実装ブランチ**: `feature/calorie-chart`, `feature/weight-trend-chart`
- **機能概要**:
  - 消費カロリーと摂取カロリーの折れ線グラフ表示
  - 体重推移の重ね合わせ表示（右軸スケール）
  - 期間選択機能（1週間/1ヶ月）
  - デュアル軸チャート（カロリー左軸、体重右軸）
- **技術仕様**:
  - **チャートライブラリ**: Recharts
  - **API最適化**: Time Series API使用によりAPI呼び出し数を大幅削減（14回→2回）
  - **データ統合**: カロリーと体重データの統合取得
  - **条件付き表示**: 体重データ存在時のみ右軸表示

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

## 開発戦略

### 品質保証

- **機能追加・修正時の必須チェック**:
  - タイプチェック (`npm run type-check`)
  - ビルド (`npm run build`)
  - 単体テスト (`npm run test`)
  - E2E テスト (`npm run test:e2e`)
- 全てのチェックをパスしてからコミット・デプロイを実行

## データフェッチ戦略

### SWR + fetch API

#### 技術選択理由

- **キャッシュ管理**: 自動的なデータキャッシュとバックグラウンド更新
- **リアルタイム性**: フォーカス時の自動再検証
- **UX 向上**: ローディング状態とエラー状態の統一管理
- **パフォーマンス**: 重複リクエストの排除と最適化

#### 実装パターン

##### 1. カスタムフック作成

```typescript
// src/hooks/useFitbitData.ts
export function useFitbitData(endpoint: string) {
  return useSWR(`/api/fitbit/${endpoint}`, fetcher, {
    refreshInterval: 300000, // 5分間隔で自動更新
    revalidateOnFocus: true,
    dedupingInterval: 60000,
  });
}
```

##### 2. API Routes との連携

```typescript
// src/app/api/fitbit/[...path]/route.ts
export async function GET(request: Request) {
  // Fitbit API呼び出し + エラーハンドリング
}
```

#### ベストプラクティス

##### データフェッチルール

1. **統一的な fetcher 関数**: エラーハンドリングと認証ヘッダーを含む
2. **適切なキー設計**: `['fitbit', endpoint, params]`形式
3. **条件付きフェッチ**: ユーザー認証状態に基づく制御
4. **楽観的更新**: mutate を使用した即座の UI 反映

##### キャッシュ戦略

- リアルタイム性を求めないため、自動更新は不要

##### エラーハンドリング

```typescript
const { data, error, isLoading, mutate } = useFitbitData("activities/steps");

if (error) {
  // APIエラー、ネットワークエラーの統一処理
  return <ErrorBoundary error={error} retry={() => mutate()} />;
}
```

#### 設定値

- **errorRetryCount**: 3 回（API 制限考慮）
- **errorRetryInterval**: 5000

## 状態管理戦略

### Jotai（グローバル状態管理）

#### 技術選択理由

- **アトミック設計**: 小さな状態単位での管理、不要な再レンダリング防止
- **TypeScript 親和性**: 完全な型安全性と IntelliSense 対応
- **ボイラープレート削減**: ミニマルな API と直感的な使用感
- **React Suspense 対応**: 非同期状態の自然な統合

#### 使用場面

1. **ユーザー認証状態**: トークン、ユーザー情報
2. **アプリケーション設定**: テーマ、言語、表示設定
3. **フィルター状態**: トレンド期間選択、データ表示設定
4. **通知・アラート状態**: エラーメッセージ、成功通知

#### 実装パターン

##### 1. Atom 定義

```typescript
// src/store/atoms.ts
export const userAtom = atom<User | null>(null);
export const themeAtom = atom<"light" | "dark">("light");
export const trendPeriodAtom = atom<"week" | "month" | "year">("week");
```

##### 2. 派生状態（Derived Atoms）

```typescript
// 認証状態の派生
export const isAuthenticatedAtom = atom((get) => !!get(userAtom));

// フィルタリングされたデータ
export const filteredDataAtom = atom((get) => {
  const period = get(trendPeriodAtom);
  const rawData = get(dataAtom);
  return filterByPeriod(rawData, period);
});
```

##### 3. 非同期 Atom

```typescript
// Health Planet取り込み状態
export const healthPlanetImportAtom = atom(
  null,
  async (get, set, csvData: string) => {
    set(importLoadingAtom, true);
    try {
      const result = await importHealthPlanetData(csvData);
      set(importSuccessAtom, true);
      return result;
    } catch (error) {
      set(importErrorAtom, error);
    } finally {
      set(importLoadingAtom, false);
    }
  }
);
```

#### ベストプラクティス

##### Atom の設計原則

1. **単一責任**: 1 つの Atom は 1 つの関心事のみ
2. **不変性**: Immer 使用またはスプレッド演算子での更新
3. **型安全性**: 厳密な型定義の徹底
4. **命名規則**: `{feature}Atom`形式での統一

##### Provider 設定

```typescript
// src/app/layout.tsx
import { Provider } from "jotai";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
```

##### ローカル状態との使い分け

- **ローカル状態（useState）**: コンポーネント固有、一時的な状態
- **Jotai**: 複数コンポーネント間共有、永続化が必要な状態
- **SWR**: サーバーサイドデータのキャッシュ・同期

##### パフォーマンス最適化

- **Atom 分割**: 関連する状態をまとめすぎない
- **選択的購読**: 必要な部分のみ監視

## Fitbit API 統合戦略

### API設計原則

#### 1. Time Series API の活用

- **目的**: API呼び出し回数の最小化とパフォーマンス向上
- **実装**: 日別個別取得から期間一括取得への移行
- **効果**: 週次データ取得で14回→2回に削減

#### 2. データ統合パターン

```typescript
// 統合取得メソッドの実装例
async getCaloriesAndWeightTimeSeries(startDate: string, endDate: string) {
  const [caloriesData, weightData] = await Promise.all([
    this.getCaloriesTimeSeries(startDate, endDate),
    this.getWeightTimeSeries(startDate, endDate)
  ]);
  
  // データマージング処理
  return mergeDataByDate(caloriesData, weightData);
}
```

#### 3. API レスポンス型定義

- **厳密な型定義**: Fitbit API仕様に基づく正確な型定義
- **レスポンス形式**: 各APIエンドポイントの実際のレスポンス構造を反映
- **エラーハンドリング**: 一貫したエラーレスポンス形式

### API エンドポイント詳細

#### `/api/fitbit/calories`

- **データソース**: Fitbit Activities API + Foods Log API + Body Weight API
- **取得データ**: 消費カロリー、摂取カロリー、体重（オプション）
- **期間指定**: week（7日間）/ month（30日間）
- **API実装**: Hono フレームワーク使用

#### Fitbit API Rate Limiting 対策

- **Time Series API**: 複数日分データの一括取得
- **並列処理**: Promise.all による同時実行
- **エラーハンドリング**: Rate Limit エラーの適切な処理

### 開発プロセス改善

#### ブランチ戦略

- **機能ブランチ**: `feature/{機能名}-{詳細}`
- **段階的実装**: 機能を小さな単位に分割して実装
- **テスト駆動**: 各実装段階でのテスト作成・実行

#### 品質保証プロセス

1. **TypeScript型チェック**: `npm run type-check`
2. **ビルド検証**: `npm run build`
3. **テスト実行**: `npm run test`

#### API開発における重要ポイント

- **テストファーストアプローチ**: API実装前のテストケース作成
- **モック戦略**: FitbitAPI クラスの適切なモック化
- **エラーケーステスト**: APIエラー、ネットワークエラーの網羅的テスト
