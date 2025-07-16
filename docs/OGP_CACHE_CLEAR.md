# SNS OGPキャッシュクリア方法

## OGP更新後の確認・キャッシュクリア手順

### 1. Facebook / Meta
**Facebook Sharing Debugger**でキャッシュをクリア：
- URL: https://developers.facebook.com/tools/debug/
- 対象URL（東京の例）: `https://www.atsusa.jp/wbgt/44132`
- 「Scrape Again」ボタンでキャッシュクリア

### 2. Twitter / X
**Card Validator**でプレビュー確認：
- URL: https://cards-dev.twitter.com/validator
- 対象URLを入力してプレビュー確認
- Twitterは比較的キャッシュが短時間

### 3. LINE
LINEは独自のOGPキャッシュを持っています：
- 自動的にキャッシュクリアされるまで15-30分程度
- 手動クリア方法はありません

### 4. Discord
Discordでのキャッシュクリア：
- メッセージ削除後に再投稿
- または時間経過を待つ（数分～30分）

## 確認用URL

### テスト対象URL
- トップページ: https://www.atsusa.jp
- 東京: https://www.atsusa.jp/wbgt/44132  
- 大阪: https://www.atsusa.jp/wbgt/62078
- 名古屋: https://www.atsusa.jp/wbgt/51106

### 期待される表示内容
**地点詳細ページの例（東京）**:
- タイトル: 東京の暑さ指数
- 説明: 【警戒レベル】東京 暑さ指数XX°C (YYYY年MM月DD日 HH時MM分更新) - 熱中症予防情報
- 画像: 暑さ指数チェッカーのOG画像

## 技術的な対策

### Next.js側の対策（実装済み）
- `dynamic = 'force-dynamic'` でISRキャッシュ無効化
- `generateMetadata`に現在時刻を含めてキャッシュバスティング
- `last-modified` ヘッダーで更新時刻を明示

### 確認コマンド
```bash
# OGPタグ確認
curl -s https://www.atsusa.jp/wbgt/44132 | grep -E "<meta property=\"og:"

# メタデータの更新時刻確認
curl -I https://www.atsusa.jp/wbgt/44132
```

## トラブルシューティング

### 症状: 古いデータが表示される
1. ブラウザのハードリロード（Ctrl+F5）
2. SNS側のキャッシュクリア（上記手順）
3. 数分待って再確認

### 症状: OGP画像が表示されない
1. 画像URLの確認: https://www.atsusa.jp/og-image.svg
2. 画像サイズの確認（1200x630推奨）
3. Content-Typeが正しいか確認

### 症状: 一部のSNSで表示されない
各SNSの仕様に応じて適切なメタタグが設定されているか確認：
- Facebook: `og:*` タグ
- Twitter: `twitter:*` タグ  
- LINE: `og:*` タグ（Twitterタグは無視）