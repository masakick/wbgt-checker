# 環境変数設定ガイド

このドキュメントは、暑さ指数チェッカーのデプロイに必要な環境変数の設定方法について説明します。

## 必須環境変数

### 1. CRON_SECRET

**用途**: Vercel Cron Jobsの認証用シークレット

**生成方法**:
```bash
openssl rand -base64 32
```

**例**: `zsVCncW4bxi+4PUCRiFiHZP6KIeDsIEM9rPC4nYqMZo=`

**説明**:
- Cron Jobsへの不正アクセスを防ぐためのセキュリティトークン
- `/api/cron/fetch-wbgt` と `/api/cron/fetch-temperature` エンドポイントで使用
- 毎時20分（気温）と40分（WBGT）の自動データ更新で必要

### 2. NEXT_PUBLIC_SITE_URL

**用途**: 本番環境のサイトURL

**形式**: `https://your-domain.com`（末尾のスラッシュなし）

**使用箇所**:
- 構造化データ（JSON-LD）
- OGP画像生成
- サイトマップ生成
- robots.txt
- PWAマニフェスト

**決定時の考慮事項**:
- HTTPSプロトコル必須（PWA要件）
- サブドメインを使用する場合: `https://wbgt.example.com`
- カスタムドメインがない場合: `https://your-project.vercel.app`

## 設定手順

### ローカル開発環境

1. `.env.local.example` を `.env.local` にコピー
```bash
cp .env.local.example .env.local
```

2. `.env.local` を編集
```env
CRON_SECRET=生成したランダム文字列
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Vercel本番環境

1. Vercelダッシュボードにログイン
2. プロジェクトの Settings → Environment Variables
3. 以下の変数を追加:
   - `CRON_SECRET`: 生成したシークレット
   - `NEXT_PUBLIC_SITE_URL`: 本番サイトのURL

## セキュリティに関する注意事項

### CRON_SECRET
- **絶対に公開しない**: GitHubにコミットしない
- **定期的に更新**: セキュリティ強化のため
- **十分な長さ**: 最低32文字以上推奨

### .gitignore の確認
```
.env.local
.env
```
上記が含まれていることを確認

## 動作確認

### 環境変数が正しく設定されているか確認

1. **ローカル環境**:
```bash
npm run dev
# ブラウザで http://localhost:3000 にアクセス
# DevTools → Network → ページリロード
# sitemap.xml や robots.txt のURLが正しいか確認
```

2. **Vercel環境**:
- デプロイ後、Vercel Functions ログを確認
- Cron Jobs実行時の認証成功を確認

## トラブルシューティング

### "Unauthorized" エラーが出る場合
- CRON_SECRETが正しく設定されているか確認
- Vercel環境変数が保存されているか確認
- 環境変数名のタイポがないか確認

### サイトマップやOGP画像のURLが間違っている場合
- NEXT_PUBLIC_SITE_URLが正しい形式か確認
- HTTPSプロトコルになっているか確認
- 末尾にスラッシュがないか確認

## 将来的な拡張（オプション）

現在は使用していませんが、将来的に以下の環境変数を追加する可能性があります：

- **Sentry** (エラー監視): SENTRY_DSN等
- **Google Analytics**: NEXT_PUBLIC_GA_MEASUREMENT_ID
- **外部API**: 気象庁API、環境省APIの認証情報等