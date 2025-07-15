# Sentryエラー監視設定ガイド

このガイドでは、熱中症予防情報サイトのSentryエラー監視設定について説明します。

## 📊 現在の設定状況

### ✅ 実装済み
- Sentryライブラリインストール済み（@sentry/nextjs v9.30.0）
- クライアント、サーバー、Edge設定ファイル作成済み
- next.config.jsへのSentry統合追加済み
- エラーフィルタリング設定済み
- パフォーマンス監視設定済み（10%サンプリング）
- リプレイ機能設定済み（エラー時10%、通常1%）

### ⚠️ 未設定
- 環境変数の設定が必要
- Sentryプロジェクトの作成が必要

## 🚀 セットアップ手順

### 1. Sentryプロジェクトの作成

1. [Sentry.io](https://sentry.io)にアクセス
2. アカウント作成またはログイン
3. 新しいプロジェクトを作成：
   - Platform: Next.js
   - Alert frequency: デフォルトまたはカスタマイズ
   - Project name: `wbgt-app`または任意の名前

### 2. 環境変数の設定

`.env.local`ファイルに以下を追加：

```bash
# Sentry設定（必須）
SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# Sentry組織・プロジェクト情報（ソースマップアップロード用）
SENTRY_ORG=your_sentry_org_name
SENTRY_PROJECT=your_sentry_project_name
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# 環境設定（オプション）
SENTRY_ENVIRONMENT=production
```

### 3. 環境変数の取得方法

#### DSNの取得
1. Sentryプロジェクトの「Settings」→「Client Keys (DSN)」
2. DSNをコピー（例：`https://xxx@xxx.ingest.sentry.io/xxx`）

#### Auth Tokenの取得
1. Sentry設定 →「API」→「Auth Tokens」
2. 新しいトークンを作成：
   - Scopes: `project:releases`を選択
   - トークンをコピーして保存

#### 組織名・プロジェクト名
- URLから確認：`https://sentry.io/organizations/[組織名]/projects/[プロジェクト名]/`

## 📝 設定の詳細

### エラーフィルタリング
以下のエラーは自動的に除外されます：
- ブラウザ拡張機能によるエラー
- ResizeObserver関連のエラー
- ネットワークエラー
- スクリプトエラー

### パフォーマンス監視
- トランザクションの10%をサンプリング
- Web Vitalsの自動計測
- APIルートのパフォーマンス追跡

### セッションリプレイ
- 通常セッションの1%を記録
- エラー発生セッションの10%を記録
- プライバシー保護のためテキストマスキングなし（設定変更可能）

## 🧪 動作確認

### 1. ローカル環境での確認
```bash
# 開発サーバーを起動
npm run dev

# ブラウザコンソールで確認
window.Sentry // undefined（開発環境では無効）
```

### 2. 本番ビルドでの確認
```bash
# 本番ビルド
NODE_ENV=production npm run build

# 本番サーバー起動
NODE_ENV=production npm start

# ブラウザコンソールで確認
window.Sentry // Sentryオブジェクトが存在
```

### 3. テストエラーの送信
```javascript
// ブラウザコンソールで実行
throw new Error("Test error from WBGT app")

// またはボタンクリックイベントなどで
Sentry.captureException(new Error("Manual test error"))
```

## 🔍 Sentryダッシュボードでの確認

1. **Issues**：エラーの一覧と詳細
2. **Performance**：パフォーマンス指標
3. **Replays**：セッションリプレイ
4. **Releases**：リリースごとのエラー追跡

## ⚙️ カスタマイズオプション

### エラー通知設定
Sentryダッシュボードで設定：
- Alert Rules：特定のエラー数やレートでの通知
- Issue Owners：特定のファイルのエラーを担当者に自動割り当て
- Integrations：Slack、メールなどへの通知

### 追加の環境変数
```bash
# サンプリングレートのカスタマイズ
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
NEXT_PUBLIC_SENTRY_REPLAY_SAMPLE_RATE=0.01

# 環境の識別
NEXT_PUBLIC_SENTRY_ENVIRONMENT=staging
```

## 📚 参考リンク

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Configuration Options](https://docs.sentry.io/platforms/javascript/configuration/options/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

## ✅ チェックリスト

デプロイ前に確認：
- [ ] Sentryプロジェクトを作成した
- [ ] 環境変数を設定した
- [ ] 本番ビルドが成功する
- [ ] Sentryダッシュボードにアクセスできる
- [ ] アラート設定を確認した
- [ ] チームメンバーを招待した（必要に応じて）