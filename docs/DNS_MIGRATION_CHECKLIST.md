# DNS移行後のタスクチェックリスト

## DNS移行完了後に実行する作業

### 1. Vercel環境変数の更新
Vercelプロジェクトの Environment Variables で以下を更新：

```bash
NEXT_PUBLIC_SITE_URL=https://atsusa.jp
```

**重要**: この変更後、Vercelプロジェクトの再デプロイが必要

### 2. 動作確認項目

#### DNS浸透確認
```bash
# Aレコード確認
dig atsusa.jp

# ネームサーバー確認  
dig NS atsusa.jp

# SSL証明書確認
openssl s_client -connect atsusa.jp:443 -servername atsusa.jp
```

#### サイト機能確認
- [ ] https://atsusa.jp へのアクセス
- [ ] SSL証明書の有効性
- [ ] トップページの正常表示
- [ ] 地点詳細ページの正常表示（5-10地点）
- [ ] お気に入り機能の動作
- [ ] PWAインストール機能
- [ ] OGP画像の表示確認（SNSシェア）
- [ ] 検索機能の動作
- [ ] ニュースページの表示

#### データ取得確認
- [ ] 最新のWBGTデータ表示
- [ ] 最新の気温データ表示
- [ ] 予報データの表示
- [ ] 更新時刻の正確性

#### Analytics確認
- [ ] Google Analytics 4 のデータ送信
- [ ] Vercel Analytics の動作
- [ ] リアルタイムユーザー数の表示

### 3. Cron Jobs動作確認
- [ ] 毎時20分：気温データ更新の動作
- [ ] 毎時40分：WBGTデータ更新の動作
- [ ] `/api/health` エンドポイントの応答

### 4. パフォーマンス確認
- [ ] Lighthouse スコアの確認
- [ ] Core Web Vitals の測定
- [ ] ページ読み込み速度の確認

### 5. 問題が発生した場合のロールバック手順

#### 緊急時のDNSロールバック
1. バリュードメイン管理画面にアクセス
2. ネームサーバーを元に戻す：
   ```
   ns1.value-domain.com → ns1.dns.ne.jp
   ns2.value-domain.com → ns2.dns.ne.jp
   ```
3. DNS浸透を待つ（30分～2時間）

#### Vercel設定のロールバック
1. `NEXT_PUBLIC_SITE_URL` を一時ドメインに戻す
2. 再デプロイ実行

## 移行完了の最終確認

すべてのチェック項目が完了したら：
- [ ] 24時間の安定動作確認
- [ ] ユーザーからの問い合わせ対応
- [ ] 移行完了の記録とドキュメント更新