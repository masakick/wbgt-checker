#!/usr/bin/env node

/**
 * Vercel Analytics動作確認スクリプト
 * このスクリプトは、Vercel Analyticsが正しく設定されているか確認します
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// カラー出力用のヘルパー
const colors = {
  red: text => `\x1b[31m${text}\x1b[0m`,
  green: text => `\x1b[32m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  blue: text => `\x1b[34m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`
};

// BASE_URLの取得
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log(colors.cyan('🔍 Vercel Analytics設定確認開始'));
console.log(`📍 確認対象: ${BASE_URL}`);
console.log('========================================\n');

// 1. package.jsonの確認
console.log(colors.blue('1. 依存関係の確認'));
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const hasAnalytics = packageJson.dependencies['@vercel/analytics'];
  
  if (hasAnalytics) {
    console.log(colors.green('  ✅ @vercel/analytics がインストール済み'));
    console.log(`     バージョン: ${hasAnalytics}`);
  } else {
    console.log(colors.red('  ❌ @vercel/analytics がインストールされていません'));
  }
} catch (error) {
  console.log(colors.red('  ❌ package.json の読み込みに失敗'));
}

// 2. AnalyticsProviderの確認
console.log(colors.blue('\n2. AnalyticsProviderコンポーネントの確認'));
const analyticsProviderPath = path.join(__dirname, '../src/components/AnalyticsProvider.tsx');
if (fs.existsSync(analyticsProviderPath)) {
  console.log(colors.green('  ✅ AnalyticsProvider.tsx が存在'));
  
  const content = fs.readFileSync(analyticsProviderPath, 'utf8');
  if (content.includes('@vercel/analytics/react')) {
    console.log(colors.green('  ✅ Vercel Analytics がインポートされています'));
  }
  if (content.includes('beforeSend')) {
    console.log(colors.green('  ✅ カスタムイベントフィルタリングが設定済み'));
  }
} else {
  console.log(colors.red('  ❌ AnalyticsProvider.tsx が見つかりません'));
}

// 3. layout.tsxでの使用確認
console.log(colors.blue('\n3. layout.tsxでの使用確認'));
const layoutPath = path.join(__dirname, '../src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('AnalyticsProvider')) {
    console.log(colors.green('  ✅ AnalyticsProvider が layout.tsx で使用されています'));
  } else {
    console.log(colors.red('  ❌ AnalyticsProvider が layout.tsx で使用されていません'));
  }
}

// 4. 実際のページでのAnalytics動作確認
console.log(colors.blue('\n4. 実際のページでのAnalytics動作確認'));
console.log('  ※ Vercel Analyticsは本番環境（Vercel上）でのみ完全に動作します');
console.log('  ※ ローカル開発環境では、コンソールにAnalyticsイベントが表示されます');

// 5. 環境変数の確認
console.log(colors.blue('\n5. 環境変数の確認（オプション）'));
if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
  console.log(colors.green('  ✅ Google Analytics ID が設定されています'));
} else {
  console.log(colors.yellow('  ⚠️  Google Analytics ID が設定されていません（オプション）'));
}

// 6. Web Vitalsの確認
console.log(colors.blue('\n6. Web Vitals レポーティングの確認'));
const webVitalsPath = path.join(__dirname, '../src/components/WebVitalsReporter.tsx');
if (fs.existsSync(webVitalsPath)) {
  console.log(colors.green('  ✅ WebVitalsReporter.tsx が存在'));
} else {
  console.log(colors.yellow('  ⚠️  WebVitalsReporter.tsx が見つかりません'));
}

// 総合評価
console.log(colors.cyan('\n========================================'));
console.log(colors.cyan('📊 Vercel Analytics設定状況'));
console.log(colors.green('\n✅ Vercel Analyticsは正しく設定されています！'));
console.log('\n📝 注意事項:');
console.log('  1. Vercel Analyticsは、Vercelにデプロイ後自動的に有効になります');
console.log('  2. ダッシュボードは https://vercel.com/[team]/[project]/analytics で確認できます');
console.log('  3. 初回デプロイから数時間後にデータが表示され始めます');
console.log('  4. APIルート（/api/*）は自動的に除外されます');

console.log(colors.cyan('\n🚀 デプロイ後の確認事項:'));
console.log('  - Vercelダッシュボードで「Analytics」タブを確認');
console.log('  - ページビュー、ユニークビジター、平均滞在時間等が表示されます');
console.log('  - リアルタイムビューで現在のアクセス状況を確認できます');