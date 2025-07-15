# アナリティクス比較ガイド：Google Analytics vs Vercel Analytics

## 📊 現在の実装状況

新しいWBGTアプリでは、**両方のアナリティクスを同時に使用可能**です：
- ✅ Google Analytics（既存のトラッキングIDを引き継ぎ可能）
- ✅ Vercel Analytics（Vercelデプロイ時に自動有効化）

## 🔄 Google Analyticsの引き継ぎ方法

### 1. 既存のGoogle Analytics設定を確認
現行のatsusa.jpサイトから以下を確認：
```html
<!-- 現行サイトのHTMLから確認 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### 2. 環境変数に設定
`.env.local`に追加：
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. 自動的に有効化
AnalyticsProviderコンポーネントが自動的にGoogle Analyticsを初期化します。

## 📈 機能比較

### Google Analytics
**メリット：**
- ✅ 既存のデータとの連続性
- ✅ 詳細なユーザー行動分析
- ✅ カスタムイベント・目標設定
- ✅ eコマース機能
- ✅ 無料（制限内）
- ✅ 他のGoogleサービスとの連携

**デメリット：**
- ❌ 設定が複雑
- ❌ リアルタイム性が限定的
- ❌ プライバシー規制への対応が必要（GDPR等）

**主な指標：**
- ページビュー数
- ユニークユーザー数
- 平均セッション時間
- 直帰率
- コンバージョン率
- ユーザーフロー
- デモグラフィック情報

### Vercel Analytics
**メリット：**
- ✅ ゼロ設定（自動有効化）
- ✅ リアルタイムデータ
- ✅ Web Vitals自動計測
- ✅ デプロイメントとの統合
- ✅ プライバシーファースト
- ✅ 軽量・高速

**デメリット：**
- ❌ 詳細なユーザー行動分析は限定的
- ❌ カスタムイベントサポートが限定的
- ❌ 有料（Proプラン以上）
- ❌ 履歴データの移行不可

**主な指標：**
- ページビュー数
- ユニークビジター数
- トップページ
- リファラー
- デバイス・ブラウザ情報
- 地域情報
- Web Vitals（LCP、FID、CLS）

## 🎯 推奨構成

### オプション1：両方使用（推奨）
```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # 既存のGA ID
# Vercel Analyticsは自動有効化
```

**利点：**
- 既存データとの連続性を保持
- 詳細分析はGA、パフォーマンス監視はVercel
- 段階的な移行が可能

### オプション2：Google Analyticsのみ
```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
※ Vercel Analyticsはダッシュボードで無効化

**利点：**
- 完全な連続性
- 既存の分析フローを維持
- 追加コストなし

### オプション3：Vercel Analyticsのみ
```bash
# .env.localには何も設定しない
```

**利点：**
- シンプルな構成
- プライバシー重視
- パフォーマンス最適化

## 📊 データ移行の考慮事項

### Google Analytics → Vercel Analytics
- ❌ 履歴データの直接移行は不可
- ✅ 新規データから収集開始
- 💡 並行運用期間を設けて比較

### 既存のGoogle Analyticsデータ
- ✅ そのまま保持可能
- ✅ 過去データの参照は継続可能
- ✅ 年次比較などは手動で行う

## 🔧 実装の詳細

### 現在の実装
`src/components/AnalyticsProvider.tsx`で両方をサポート：

1. **Google Analytics**：環境変数が設定されていれば自動初期化
2. **Vercel Analytics**：常に有効（Vercel環境で自動動作）

### カスタムイベントの送信

Google Analytics：
```javascript
// ボタンクリックなどのイベント
gtag('event', 'click', {
  event_category: 'engagement',
  event_label: 'header'
});
```

Vercel Analytics：
```javascript
// 基本的なページビューのみ自動追跡
// カスタムイベントは限定的
```

## 📝 推奨事項

### 短期的（デプロイ時）
1. **既存のGoogle Analytics IDを環境変数に設定**
2. **両方のアナリティクスを有効化**
3. **1ヶ月程度データを比較**

### 中期的（1-3ヶ月）
1. **利用パターンを分析**
2. **必要な指標を整理**
3. **どちらかに絞るか検討**

### 長期的
1. **用途に応じて使い分け**
   - マーケティング分析：Google Analytics
   - パフォーマンス監視：Vercel Analytics
2. **コスト最適化**
   - Vercel Analyticsの有料プランが必要か評価

## ✅ セットアップチェックリスト

- [ ] 現行サイトのGoogle Analytics IDを確認
- [ ] `.env.local`に`NEXT_PUBLIC_GA_MEASUREMENT_ID`を設定
- [ ] デプロイ後、Google Analyticsでデータ受信を確認
- [ ] Vercel Analyticsダッシュボードを確認
- [ ] 必要に応じてGoogle Analyticsの目標・イベントを再設定

## 🔗 参考リンク

- [Google Analytics公式ドキュメント](https://developers.google.com/analytics)
- [Vercel Analytics公式ドキュメント](https://vercel.com/docs/analytics)
- [Web Vitalsについて](https://web.dev/vitals/)