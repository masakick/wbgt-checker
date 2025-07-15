#!/usr/bin/env node

/**
 * Sentryエラー監視設定確認スクリプト
 * このスクリプトは、Sentryが正しく設定されているか確認します
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

console.log(colors.cyan('🔍 Sentry設定確認開始'));
console.log('========================================\n');

let checkResults = {
  package: false,
  clientConfig: false,
  serverConfig: false,
  edgeConfig: false,
  envVars: false,
  nextConfig: false
};

// 1. package.jsonの確認
console.log(colors.blue('1. 依存関係の確認'));
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const hasSentry = packageJson.devDependencies['@sentry/nextjs'] || packageJson.dependencies['@sentry/nextjs'];
  
  if (hasSentry) {
    console.log(colors.green('  ✅ @sentry/nextjs がインストール済み'));
    console.log(`     バージョン: ${hasSentry}`);
    checkResults.package = true;
  } else {
    console.log(colors.red('  ❌ @sentry/nextjs がインストールされていません'));
  }
} catch (error) {
  console.log(colors.red('  ❌ package.json の読み込みに失敗'));
}

// 2. Sentry設定ファイルの確認
console.log(colors.blue('\n2. Sentry設定ファイルの確認'));

// Client設定
const clientConfigPath = path.join(__dirname, '../sentry.client.config.ts');
if (fs.existsSync(clientConfigPath)) {
  console.log(colors.green('  ✅ sentry.client.config.ts が存在'));
  checkResults.clientConfig = true;
  
  const content = fs.readFileSync(clientConfigPath, 'utf8');
  if (content.includes('dsn:')) {
    console.log(colors.green('     DSN設定が見つかりました'));
  }
  if (content.includes('environment:')) {
    console.log(colors.green('     環境設定が見つかりました'));
  }
} else {
  console.log(colors.red('  ❌ sentry.client.config.ts が見つかりません'));
}

// Server設定
const serverConfigPath = path.join(__dirname, '../sentry.server.config.ts');
if (fs.existsSync(serverConfigPath)) {
  console.log(colors.green('  ✅ sentry.server.config.ts が存在'));
  checkResults.serverConfig = true;
} else {
  console.log(colors.red('  ❌ sentry.server.config.ts が見つかりません'));
}

// Edge設定
const edgeConfigPath = path.join(__dirname, '../sentry.edge.config.ts');
if (fs.existsSync(edgeConfigPath)) {
  console.log(colors.green('  ✅ sentry.edge.config.ts が存在'));
  checkResults.edgeConfig = true;
} else {
  console.log(colors.red('  ❌ sentry.edge.config.ts が見つかりません'));
}

// 3. 環境変数の確認
console.log(colors.blue('\n3. 環境変数の確認'));
const requiredEnvVars = [
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'SENTRY_AUTH_TOKEN'
];

let envVarsSet = 0;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(colors.green(`  ✅ ${envVar} が設定されています`));
    envVarsSet++;
  } else {
    console.log(colors.yellow(`  ⚠️  ${envVar} が設定されていません`));
  }
});

if (envVarsSet === requiredEnvVars.length) {
  checkResults.envVars = true;
}

// 4. next.config.jsでのSentry設定確認
console.log(colors.blue('\n4. next.config.jsでのSentry設定確認'));
const nextConfigPath = path.join(__dirname, '../next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  if (nextConfigContent.includes('withSentryConfig') || nextConfigContent.includes('@sentry/nextjs')) {
    console.log(colors.green('  ✅ Sentryがnext.config.jsに統合されています'));
    checkResults.nextConfig = true;
  } else {
    console.log(colors.yellow('  ⚠️  Sentryがnext.config.jsに統合されていない可能性があります'));
  }
}

// 5. エラーページの確認
console.log(colors.blue('\n5. エラーページの確認'));
const errorPagePath = path.join(__dirname, '../src/app/error.tsx');
const globalErrorPath = path.join(__dirname, '../src/app/global-error.tsx');

if (fs.existsSync(errorPagePath)) {
  console.log(colors.green('  ✅ error.tsx が存在'));
} else {
  console.log(colors.yellow('  ⚠️  error.tsx が見つかりません（オプション）'));
}

if (fs.existsSync(globalErrorPath)) {
  console.log(colors.green('  ✅ global-error.tsx が存在'));
} else {
  console.log(colors.yellow('  ⚠️  global-error.tsx が見つかりません（オプション）'));
}

// 総合評価
console.log(colors.cyan('\n========================================'));
console.log(colors.cyan('📊 Sentry設定状況'));

const allChecks = Object.values(checkResults);
const passedChecks = allChecks.filter(check => check).length;

if (passedChecks === allChecks.length) {
  console.log(colors.green('\n✅ Sentryは完全に設定されています！'));
} else if (passedChecks >= 3) {
  console.log(colors.yellow('\n⚠️  Sentryは部分的に設定されています'));
  console.log('   環境変数の設定を確認してください');
} else {
  console.log(colors.red('\n❌ Sentryの設定が不完全です'));
}

console.log('\n📝 Sentry設定の推奨事項:');
console.log('  1. 本番環境では必ず環境変数を設定してください:');
console.log('     - SENTRY_DSN: SentryプロジェクトのDSN');
console.log('     - SENTRY_ORG: Sentry組織名');
console.log('     - SENTRY_PROJECT: Sentryプロジェクト名');
console.log('     - SENTRY_AUTH_TOKEN: ソースマップアップロード用');
console.log('  2. エラー通知設定を確認してください');
console.log('  3. パフォーマンス監視も有効化することを推奨します');

console.log(colors.cyan('\n🚀 デプロイ後の確認事項:'));
console.log('  - Sentryダッシュボードでエラーが捕捉されているか確認');
console.log('  - ソースマップが正しくアップロードされているか確認');
console.log('  - アラート設定が適切に構成されているか確認');

// テストエラーの送信方法
console.log(colors.cyan('\n🧪 テストエラーの送信方法:'));
console.log('  本番環境でテストエラーを送信するには:');
console.log('  1. ブラウザコンソールで: throw new Error("Test error from browser")');
console.log('  2. APIルートで意図的にエラーをスロー');
console.log('  3. Sentryダッシュボードで受信確認');