#!/usr/bin/env node

/**
 * 本番環境パフォーマンス測定スクリプト
 * 
 * 使用方法:
 * NODE_ENV=production BASE_URL=https://your-domain.com node scripts/test-performance.js
 */

const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

// 設定
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_ITERATIONS = 3; // 各テストの実行回数
const TIMEOUT = 30000; // 30秒タイムアウト

// テスト結果を格納
const results = {
  environment: {
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    userAgent: 'Node.js Performance Test'
  },
  tests: {
    pages: [],
    api: [],
    resources: []
  },
  summary: {
    totalTests: 0,
    averageResponseTime: 0,
    slowestPage: null,
    fastestPage: null,
    errors: []
  }
};

// パフォーマンス測定用のfetch関数
async function measurePerformance(url, options = {}) {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    
    return {
      success: true,
      status: response.status,
      responseTime,
      size: contentLength ? parseInt(contentLength) : null,
      contentType,
      url
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      success: false,
      error: error.message,
      responseTime: Math.round(endTime - startTime),
      url
    };
  }
}

// 複数回実行して平均を取得
async function runMultipleTests(url, testName, iterations = TEST_ITERATIONS) {
  console.log(`\n📊 ${testName} (${iterations}回測定)`);
  console.log(`URL: ${url}`);
  
  const testResults = [];
  
  for (let i = 0; i < iterations; i++) {
    const result = await measurePerformance(url);
    testResults.push(result);
    
    if (result.success) {
      console.log(`  Test ${i + 1}: ${result.responseTime}ms (${result.status})`);
    } else {
      console.log(`  Test ${i + 1}: ❌ ${result.error}`);
    }
    
    // テスト間に少し間隔を開ける
    if (i < iterations - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // 統計計算
  const successfulTests = testResults.filter(r => r.success);
  if (successfulTests.length === 0) {
    console.log(`❌ 全てのテストが失敗`);
    return null;
  }
  
  const avgResponseTime = Math.round(
    successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length
  );
  const minResponseTime = Math.min(...successfulTests.map(r => r.responseTime));
  const maxResponseTime = Math.max(...successfulTests.map(r => r.responseTime));
  
  const summary = {
    name: testName,
    url,
    iterations,
    successCount: successfulTests.length,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    size: successfulTests[0]?.size || null,
    contentType: successfulTests[0]?.contentType || null,
    errors: testResults.filter(r => !r.success).map(r => r.error)
  };
  
  console.log(`  ✅ 平均: ${avgResponseTime}ms | 最速: ${minResponseTime}ms | 最遅: ${maxResponseTime}ms`);
  if (summary.size) {
    console.log(`  📦 サイズ: ${(summary.size / 1024).toFixed(2)} KB`);
  }
  
  return summary;
}

// ページパフォーマンステスト
async function testPagePerformance() {
  console.log('\n=== ページパフォーマンステスト ===');
  
  const pageTests = [
    { name: 'トップページ', url: `${BASE_URL}/` },
    { name: '東京詳細ページ', url: `${BASE_URL}/wbgt/44132` },
    { name: '大阪詳細ページ', url: `${BASE_URL}/wbgt/62078` },
    { name: '札幌詳細ページ', url: `${BASE_URL}/wbgt/11001` },
    { name: '福岡詳細ページ', url: `${BASE_URL}/wbgt/83216` },
    { name: 'About ページ', url: `${BASE_URL}/about` }
  ];
  
  for (const test of pageTests) {
    const result = await runMultipleTests(test.url, test.name);
    if (result) {
      results.tests.pages.push(result);
    }
  }
}

// API パフォーマンステスト
async function testAPIPerformance() {
  console.log('\n=== API パフォーマンステスト ===');
  
  const apiTests = [
    { name: 'サイトマップ', url: `${BASE_URL}/sitemap.xml` },
    { name: 'PWA マニフェスト', url: `${BASE_URL}/manifest.json` },
    { name: '動的マニフェスト（東京）', url: `${BASE_URL}/api/manifest/44132` }
  ];
  
  for (const test of apiTests) {
    const result = await runMultipleTests(test.url, test.name);
    if (result) {
      results.tests.api.push(result);
    }
  }
}

// リソースパフォーマンステスト
async function testResourcePerformance() {
  console.log('\n=== リソースパフォーマンステスト ===');
  
  const resourceTests = [
    { name: 'OGP画像', url: `${BASE_URL}/og-image.svg` },
    { name: 'PWAアイコン (192x192)', url: `${BASE_URL}/icons/icon-192x192.png` },
    { name: 'PWAアイコン (512x512)', url: `${BASE_URL}/icons/icon-512x512.png` },
    { name: 'Apple Touch Icon', url: `${BASE_URL}/apple-touch-icon.png` }
  ];
  
  for (const test of resourceTests) {
    const result = await runMultipleTests(test.url, test.name, 2); // リソースは2回測定
    if (result) {
      results.tests.resources.push(result);
    }
  }
}

// Core Web Vitals シミュレーション（簡易版）
async function testCoreWebVitals() {
  console.log('\n=== Core Web Vitals シミュレーション ===');
  
  const testPages = [
    { name: 'トップページ', url: `${BASE_URL}/` },
    { name: '東京詳細ページ', url: `${BASE_URL}/wbgt/44132` }
  ];
  
  for (const page of testPages) {
    console.log(`\n🔍 ${page.name}`);
    
    // LCP (Largest Contentful Paint) の代替として、ページの応答時間を測定
    const result = await measurePerformance(page.url);
    if (result.success) {
      const lcp = result.responseTime;
      const lcpGrade = lcp <= 2500 ? '✅ Good' : lcp <= 4000 ? '⚠️ Needs Improvement' : '❌ Poor';
      console.log(`  LCP (代替): ${lcp}ms ${lcpGrade}`);
      
      // FID (First Input Delay) は測定困難のためスキップ
      console.log(`  FID: 測定不可（ブラウザ環境が必要）`);
      
      // CLS (Cumulative Layout Shift) も測定困難のためスキップ
      console.log(`  CLS: 測定不可（ブラウザ環境が必要）`);
      
      // ページサイズから推測されるパフォーマンス
      if (result.size) {
        const sizeKB = result.size / 1024;
        const sizeGrade = sizeKB <= 100 ? '✅ Good' : sizeKB <= 300 ? '⚠️ Moderate' : '❌ Large';
        console.log(`  ページサイズ: ${sizeKB.toFixed(2)} KB ${sizeGrade}`);
      }
    } else {
      console.log(`  ❌ 測定失敗: ${result.error}`);
    }
  }
}

// 結果サマリー生成
function generateSummary() {
  const allTests = [...results.tests.pages, ...results.tests.api, ...results.tests.resources];
  
  if (allTests.length === 0) {
    results.summary.totalTests = 0;
    return;
  }
  
  results.summary.totalTests = allTests.length;
  results.summary.averageResponseTime = Math.round(
    allTests.reduce((sum, test) => sum + test.avgResponseTime, 0) / allTests.length
  );
  
  // 最遅・最速ページ
  const sortedBySpeed = allTests.sort((a, b) => a.avgResponseTime - b.avgResponseTime);
  results.summary.fastestPage = sortedBySpeed[0];
  results.summary.slowestPage = sortedBySpeed[sortedBySpeed.length - 1];
  
  // エラー収集
  results.summary.errors = allTests
    .filter(test => test.errors.length > 0)
    .map(test => ({
      name: test.name,
      url: test.url,
      errors: test.errors
    }));
}

// レポート出力
async function generateReport() {
  console.log('\n=== パフォーマンステスト結果サマリー ===\n');
  
  generateSummary();
  
  console.log(`🎯 テスト環境: ${results.environment.baseUrl}`);
  console.log(`📊 総テスト数: ${results.summary.totalTests}`);
  console.log(`⏱️  平均応答時間: ${results.summary.averageResponseTime}ms`);
  
  if (results.summary.fastestPage) {
    console.log(`🚀 最速ページ: ${results.summary.fastestPage.name} (${results.summary.fastestPage.avgResponseTime}ms)`);
  }
  
  if (results.summary.slowestPage) {
    console.log(`🐌 最遅ページ: ${results.summary.slowestPage.name} (${results.summary.slowestPage.avgResponseTime}ms)`);
  }
  
  if (results.summary.errors.length > 0) {
    console.log(`\n❌ エラーが発生したテスト: ${results.summary.errors.length}件`);
    results.summary.errors.forEach(error => {
      console.log(`  - ${error.name}: ${error.errors.join(', ')}`);
    });
  }
  
  // パフォーマンス評価
  console.log('\n📈 パフォーマンス評価:');
  const avgTime = results.summary.averageResponseTime;
  if (avgTime <= 1000) {
    console.log('  ✅ 優秀 (1秒以下)');
  } else if (avgTime <= 3000) {
    console.log('  ⚠️ 良好 (3秒以下)');
  } else {
    console.log('  ❌ 改善必要 (3秒超過)');
  }
  
  // 詳細レポートファイル生成
  const reportDir = path.join(process.cwd(), 'test-results');
  await fs.mkdir(reportDir, { recursive: true });
  
  const reportPath = path.join(reportDir, 'performance-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📋 詳細レポート: ${reportPath}`);
}

// メイン実行
async function main() {
  console.log('🚀 本番環境パフォーマンステスト開始');
  console.log(`🌐 テスト対象: ${BASE_URL}`);
  console.log('========================================');
  
  try {
    await testPagePerformance();
    await testAPIPerformance();
    await testResourcePerformance();
    await testCoreWebVitals();
    await generateReport();
    
    // 終了コード
    const hasErrors = results.summary.errors.length > 0;
    const isSlowPerformance = results.summary.averageResponseTime > 5000;
    
    if (hasErrors || isSlowPerformance) {
      console.log('\n⚠️ パフォーマンステストで問題が検出されました');
      process.exit(1);
    } else {
      console.log('\n✅ パフォーマンステスト完了 - 問題なし');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ 予期しないエラー:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}