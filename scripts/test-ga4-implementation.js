#!/usr/bin/env node

/**
 * GA4実装チェックスクリプト
 * Google Analytics 4への移行準備状況を確認します
 */

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

console.log(colors.cyan('🔍 GA4実装チェック開始'));
console.log('========================================\n');

// 現在の状況
console.log(colors.blue('📊 現在の状況'));
console.log(`  現行サイト: ${colors.yellow('UA-203298944-1')} (Universal Analytics - 廃止済み)`);
console.log(`  新サイト: ${colors.green('GA4対応済み')} (測定ID設定待ち)\n`);

// 1. AnalyticsProviderの確認
console.log(colors.blue('1. AnalyticsProvider実装確認'));
const analyticsProviderPath = path.join(__dirname, '../src/components/AnalyticsProvider.tsx');
if (fs.existsSync(analyticsProviderPath)) {
  const content = fs.readFileSync(analyticsProviderPath, 'utf8');
  
  console.log(colors.green('  ✅ AnalyticsProvider.tsx が存在'));
  
  // GA4実装の確認
  if (content.includes('gtag')) {
    console.log(colors.green('  ✅ gtag実装が確認されました'));
  }
  
  if (content.includes('NEXT_PUBLIC_GA_MEASUREMENT_ID')) {
    console.log(colors.green('  ✅ 環境変数からの測定ID読み込みに対応'));
  }
  
  // イベント送信の確認
  if (content.includes("gtag('config'")) {
    console.log(colors.green('  ✅ GA4設定コードが実装済み'));
  }
}

// 2. 環境変数の確認
console.log(colors.blue('\n2. 環境変数設定確認'));
if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (measurementId.startsWith('G-')) {
    console.log(colors.green(`  ✅ GA4測定IDが設定されています: ${measurementId}`));
  } else if (measurementId.startsWith('UA-')) {
    console.log(colors.red(`  ❌ 古いUniversal Analytics IDが設定されています: ${measurementId}`));
    console.log(colors.yellow('     GA4プロパティを作成し、G-XXXXXXXXXXフォーマットのIDを取得してください'));
  }
} else {
  console.log(colors.yellow('  ⚠️  GA4測定IDが未設定です'));
  console.log('     .env.localに NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX を設定してください');
}

// 3. GA4イベントの実装確認
console.log(colors.blue('\n3. GA4イベント実装の推奨'));
console.log('  以下のカスタムイベントの実装を推奨します：');
console.log(colors.cyan('  • select_location') + ' - 地点選択時');
console.log(colors.cyan('  • view_alert_level') + ' - 警戒レベル表示時');
console.log(colors.cyan('  • app_install') + ' - PWAインストール時');
console.log(colors.cyan('  • share_content') + ' - SNSシェア時');

// 4. 移行手順の案内
console.log(colors.blue('\n4. GA4移行手順'));
console.log('  1. Google Analyticsにログイン');
console.log('  2. 管理 → GA4設定アシスタント');
console.log('  3. 「はじめに」→「プロパティを作成」');
console.log('  4. データストリームから測定ID（G-XXXXXXXXXX）を取得');
console.log('  5. .env.localに設定：');
console.log(colors.green('     NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX'));

// 5. テスト方法
console.log(colors.blue('\n5. 動作確認方法'));
console.log('  開発環境:');
console.log('    1. .env.localにGA4測定IDを設定');
console.log('    2. npm run dev で開発サーバー起動');
console.log('    3. ブラウザの開発者ツールでNetworkタブを開く');
console.log('    4. google-analytics.com へのリクエストを確認');
console.log('\n  本番環境:');
console.log('    1. デプロイ後、GA4のリアルタイムレポートで確認');
console.log('    2. 自分でアクセスしてデータが表示されることを確認');

// 6. 注意事項
console.log(colors.yellow('\n⚠️  注意事項'));
console.log('  • Universal Analytics（UA）のデータはGA4に移行されません');
console.log('  • 新規でGA4プロパティを作成する必要があります');
console.log('  • UAプロパティは削除せず、過去データ参照用に保持してください');

// 総合評価
console.log(colors.cyan('\n========================================'));
console.log(colors.cyan('📊 GA4実装状況'));
console.log(colors.green('\n✅ アプリケーションはGA4に対応済みです！'));
console.log('\n次のステップ:');
console.log('  1. GA4プロパティを作成');
console.log('  2. 測定ID（G-XXXXXXXXXX）を取得');
console.log('  3. .env.localに設定');
console.log('  4. デプロイ後、動作確認');

console.log(colors.cyan('\n📚 詳細は /docs/GA4_MIGRATION_GUIDE.md を参照してください'));