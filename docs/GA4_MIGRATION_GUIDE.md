# Google Analytics 4 (GA4) 移行ガイド

## 📊 現在の状況
- **現行**: Universal Analytics (UA-203298944-1)
- **目標**: Google Analytics 4 (GA4) への移行

## 🚀 GA4プロパティの作成手順

### ステップ1: Google Analyticsにアクセス
1. [Google Analytics](https://analytics.google.com)にログイン
2. 現在のUAプロパティが表示されていることを確認

### ステップ2: GA4プロパティを作成

#### 方法A: 既存のUAプロパティから作成（推奨）
1. 左下の「⚙️管理」をクリック
2. プロパティ列で現在のプロパティ（atsusa.jp）を選択
3. 「GA4設定アシスタント」をクリック
4. 「新しいGoogle Analytics 4プロパティを作成する」の下の「はじめに」をクリック
5. 「プロパティを作成」をクリック

![GA4設定アシスタント](https://support.google.com/analytics/answer/9744165?hl=ja)

#### 方法B: 新規でGA4プロパティを作成
1. 左下の「⚙️管理」をクリック
2. 「プロパティを作成」をクリック
3. プロパティ名を入力（例：atsusa.jp - GA4）
4. タイムゾーン：日本
5. 通貨：日本円（JPY）
6. 「次へ」をクリック
7. ビジネス情報を入力：
   - 業種：その他
   - ビジネスの規模：小
8. ビジネス目標を選択（該当するものすべて）
9. 「作成」をクリック

### ステップ3: 測定IDを取得

1. GA4プロパティが作成されたら、「管理」→「データストリーム」
2. 「ウェブ」をクリック（既に作成されている場合はそれをクリック）
3. ウェブサイトのURLを入力：
   - URL: `https://atsusa.jp`（または新しいドメイン）
   - ストリーム名: `atsusa.jp Web`
4. 「ストリームを作成」をクリック
5. **測定ID**（G-XXXXXXXXXX形式）をコピー

### ステップ4: 新しいWBGTアプリに設定

`.env.local`ファイルに追加：
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📈 GA4の初期設定

### 基本設定の確認
1. **データ保持期間**：
   - 管理 → データ設定 → データ保持
   - イベントデータの保持：14か月に設定

2. **Google シグナル**：
   - 管理 → データ設定 → データ収集
   - Google シグナルのデータ収集を有効化

3. **拡張計測機能**（自動的に有効）：
   - ページビュー
   - スクロール
   - 離脱クリック
   - サイト内検索
   - 動画エンゲージメント
   - ファイルのダウンロード

### 推奨イベントの設定

GA4では以下のイベントが自動的に収集されます：
- `page_view` - ページビュー
- `session_start` - セッション開始
- `first_visit` - 初回訪問
- `user_engagement` - ユーザーエンゲージメント

### カスタムイベントの例（必要に応じて）

```javascript
// 地点選択イベント
gtag('event', 'select_location', {
  location_code: '44132',
  location_name: '東京',
  method: 'search' // または 'region_list', 'favorites'
});

// 警戒レベル表示イベント
gtag('event', 'view_alert_level', {
  location_code: '44132',
  alert_level: 4,
  wbgt_value: 31
});

// PWAインストール
gtag('event', 'app_install', {
  method: 'pwa'
});
```

## 🔄 UAからGA4への違い

### 主な変更点
1. **イベント中心のデータモデル**
   - すべてがイベントとして記録される
   - ページビューもイベントの一つ

2. **セッションの定義**
   - UAより柔軟なセッション定義
   - エンゲージメントセッションの概念

3. **レポート**
   - より柔軟なカスタムレポート
   - 探索機能で詳細分析

4. **指標の変更**
   - 直帰率 → エンゲージメント率
   - 新しい指標：エンゲージメント時間

## 📊 移行後の確認

### リアルタイムレポートで確認
1. GA4プロパティで「レポート」→「リアルタイム」
2. 自分でサイトにアクセスして、データが表示されることを確認

### デバッグモード
開発環境でのテスト：
```javascript
// デバッグモードを有効化
gtag('config', 'G-XXXXXXXXXX', {
  'debug_mode': true
});
```

GA4の「DebugView」でイベントを確認できます。

## 🎯 移行チェックリスト

- [ ] GA4プロパティを作成
- [ ] 測定ID（G-XXXXXXXXXX）を取得
- [ ] `.env.local`に測定IDを設定
- [ ] デプロイ後、リアルタイムレポートで確認
- [ ] 必要なカスタムイベントを実装
- [ ] データ保持期間を14か月に設定
- [ ] Google シグナルを有効化
- [ ] 主要な指標が収集されていることを確認

## 📚 参考資料

- [GA4移行ガイド（Google公式）](https://support.google.com/analytics/answer/10759417?hl=ja)
- [GA4とUAの違い](https://support.google.com/analytics/answer/9964640?hl=ja)
- [GA4イベントリファレンス](https://support.google.com/analytics/answer/9267735?hl=ja)
- [GA4のベストプラクティス](https://support.google.com/analytics/answer/9267735?hl=ja)

## ⚠️ 注意事項

1. **UAのデータはGA4に移行されません**
   - 過去のデータはUAプロパティで参照
   - 新規データはGA4で収集

2. **レポートの違い**
   - UAとGA4ではレポート形式が異なる
   - 慣れるまで時間がかかる可能性

3. **並行運用期間**
   - UAプロパティは削除せず保持
   - 必要に応じて過去データを参照

## 💡 ヒント

- GA4は学習曲線があるため、早めに移行して慣れることが重要
- Vercel Analyticsと併用することで、シンプルな指標とWeb Vitalsを補完
- 最初はシンプルに始めて、徐々に高度な機能を活用