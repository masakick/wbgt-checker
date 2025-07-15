# GA4移行チェックリスト

## ✅ 完了済み項目
- [x] アプリケーションのGA4対応実装
- [x] AnalyticsProviderコンポーネント作成
- [x] gtag.js実装
- [x] 環境変数対応
- [x] GA4移行ガイド作成

## 📋 実施予定項目

### 1. Google Analytics側の作業
- [x] Google Analyticsにログイン
- [x] 既存のUAプロパティ（UA-203298944-1）を確認
- [x] GA4設定アシスタントから新規GA4プロパティを作成
- [x] データストリームを設定（atsusa.jp）
- [x] 測定ID（G-1BTG0D3C6K）を取得

### 2. アプリケーション設定
- [x] `.env.local`ファイルを作成/編集
- [x] `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-1BTG0D3C6K`を追加
- [x] 開発環境で動作確認

### 3. カスタムイベント実装（オプション）
- [ ] 地点選択イベント（select_location）
- [ ] 警戒レベル表示イベント（view_alert_level）
- [ ] PWAインストールイベント（app_install）
- [ ] SNSシェアイベント（share_content）

### 4. デプロイ後の確認
- [ ] Vercel環境変数に`NEXT_PUBLIC_GA_MEASUREMENT_ID`を設定
- [ ] デプロイ実行
- [ ] GA4リアルタイムレポートで動作確認
- [ ] 24時間後、基本レポートでデータ収集確認

### 5. 運用開始後
- [ ] GA4の探索機能でカスタムレポート作成
- [ ] コンバージョン設定（必要に応じて）
- [ ] オーディエンス設定
- [ ] UAデータとの比較分析（手動）

## 📝 メモ
- 現行サイトのUA ID: `UA-203298944-1`
- 新サイトのGA4 ID: `G-XXXXXXXXXX`（取得後記入）
- 移行完了日: ____年____月____日