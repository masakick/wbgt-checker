# 暑さ指数チェッカー

全国840地点の暑さ指数（WBGT）をリアルタイムで確認できる熱中症予防Webアプリケーション

## 🌡️ 主要機能

- **全国840地点対応**: 日本全国の暑さ指数をリアルタイム表示
- **21時点詳細予報**: 3日間・3時間間隔の詳細予報表示
- **運動指針ガイド**: 5段階の警戒レベルと運動時の対処法
- **PWA対応**: ホーム画面への追加でアプリライクな体験
- **QRコード共有**: 各地点の情報を簡単に共有
- **モバイル最適化**: スマートフォンでの使いやすさを重視

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **PWA**: カスタムサービスワーカー
- **デプロイ**: Vercel対応（Cron Jobs利用）

## 📱 PWA対応

- `manifest.json`でホーム画面追加対応
- サービスワーカーによる基本的なキャッシング
- インストールプロンプトの表示

## 🔄 データ更新スケジュール

環境省・気象庁のデータを自動取得：

- **毎時20分**: 気温データ更新（`/api/cron/fetch-temperature`）
- **毎時40分**: WBGT データ更新（`/api/cron/fetch-wbgt`）

## 🚀 開発・デプロイ

### 開発環境セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# CRON_SECRET を設定

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

### 環境変数

```bash
# Vercel Cron Jobs認証用
CRON_SECRET=your-secret-key-here

# サイトURL（本番環境）
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Vercelデプロイ

1. リポジトリをVercelに接続
2. 環境変数を設定
3. `vercel.json`でCron Jobsが自動設定される

## 📊 データ構造

### WBGT データ (`/public/data/wbgt.json`)

```json
{
  "timestamp": "2025-06-20T05:40:00.000Z",
  "updateTime": "2025年6月20日 14:40",
  "dataCount": 840,
  "data": [
    {
      "locationCode": "44132",
      "locationName": "東京",
      "prefecture": "東京都",
      "wbgt": 28.5,
      "temperature": 32.1,
      "humidity": 65,
      "timestamp": "2025-06-20T05:40:00.000Z",
      "forecast": [...]
    }
  ]
}
```

## 🔗 API エンドポイント

- `GET /api/cron/fetch-wbgt` - WBGT データ取得・更新
- `POST /api/cron/fetch-wbgt` - 手動データ更新
- `GET /api/cron/fetch-temperature` - 気温データ取得・更新
- `POST /api/cron/fetch-temperature` - 手動データ更新

## 📱 ページ構成

- `/` - トップページ（地点選択）
- `/wbgt/[locationCode]` - 地点別詳細ページ（840地点対応）
- `/full-mockup` - 開発用モックアップページ

## 🌐 対応ブラウザ

- Chrome 80+
- Firefox 74+
- Safari 13+
- Edge 80+

## 📋 警戒レベル

| レベル | WBGT | 色 | 指針 |
|--------|------|----|----|
| 危険 | 31°C以上 | 赤 | 運動は原則中止 |
| 厳重警戒 | 28-31°C | オレンジ | 激しい運動は中止 |
| 警戒 | 25-28°C | 黄 | 積極的に休息 |
| 注意 | 21-25°C | 緑 | 積極的に水分補給 |
| 安全 | 21°C未満 | 青 | 適宜水分補給 |

## 📄 データ提供

- **環境省**: [熱中症予防情報サイト](https://www.wbgt.env.go.jp/sp/)
- **気象庁**: [気象データ](https://www.jma.go.jp/)

## 👤 開発者

慶應義塾大学大学院 政策・メディア研究科 山辺真幸  
Twitter: [@masakick](https://twitter.com/masakick)

## 📝 ライセンス

MIT License

---

熱中症予防にお役立てください 🌡️💧
