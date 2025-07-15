#!/usr/bin/env node

/**
 * Lighthouse風パフォーマンス評価スクリプト
 * 
 * 使用方法:
 * BASE_URL=https://your-domain.com node scripts/lighthouse-test.js
 * 
 * 注意: 実際のLighthouse測定には別途lighthouseパッケージが必要
 */

const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// パフォーマンス評価基準
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals (ms)
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  
  // その他の指標 (ms)
  FCP: { good: 1800, poor: 3000 },
  TTI: { good: 3800, poor: 7300 },
  TBT: { good: 200, poor: 600 },
  
  // ページサイズ (KB)
  pageSize: { good: 500, poor: 1500 },
  
  // 総合応答時間 (ms)
  responseTime: { good: 1000, poor: 3000 }
};

// スコア計算関数
function calculateScore(value, metric) {
  const thresholds = PERFORMANCE_THRESHOLDS[metric];
  if (!thresholds) return 50;
  
  if (value <= thresholds.good) return 100;
  if (value >= thresholds.poor) return 0;
  
  // 線形補間
  const range = thresholds.poor - thresholds.good;
  const position = value - thresholds.good;
  return Math.max(0, Math.min(100, 100 - (position / range) * 100));
}

// グレード変換
function getGrade(score) {
  if (score >= 90) return { grade: 'A', color: '🟢', status: 'Good' };
  if (score >= 75) return { grade: 'B', color: '🟡', status: 'Needs Improvement' };
  return { grade: 'C', color: '🔴', status: 'Poor' };
}

// 総合ページ評価
async function evaluatePage(url, pageName) {
  console.log(`\n📊 ${pageName} の評価`);
  console.log(`🔗 ${url}`);
  
  const startTime = performance.now();
  
  try {
    const response = await fetch(url);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    const pageSize = contentLength ? parseInt(contentLength) / 1024 : null;
    
    // パフォーマンス指標の計算（実際のブラウザ測定の代替）
    const metrics = {
      LCP: responseTime * 1.2, // 応答時間の1.2倍と仮定
      FCP: responseTime * 0.8, // 応答時間の0.8倍と仮定
      TTI: responseTime * 1.5, // 応答時間の1.5倍と仮定
      TBT: Math.max(0, responseTime - 1000) * 0.3, // 1秒超過分の30%と仮定
      responseTime,
      pageSize: pageSize || 0
    };
    
    // スコア計算
    const scores = {
      LCP: calculateScore(metrics.LCP, 'LCP'),
      FCP: calculateScore(metrics.FCP, 'FCP'),
      TTI: calculateScore(metrics.TTI, 'TTI'),
      TBT: calculateScore(metrics.TBT, 'TBT'),
      responseTime: calculateScore(metrics.responseTime, 'responseTime'),
      pageSize: pageSize ? calculateScore(pageSize, 'pageSize') : 100
    };
    
    // 総合スコア計算（重み付き平均）
    const weights = {
      LCP: 0.25,
      FCP: 0.15,
      TTI: 0.15,
      TBT: 0.15,
      responseTime: 0.20,
      pageSize: 0.10
    };
    
    const overallScore = Math.round(
      Object.keys(weights).reduce((total, metric) => {
        return total + (scores[metric] * weights[metric]);
      }, 0)
    );
    
    const grade = getGrade(overallScore);
    
    // 結果表示
    console.log(`\n${grade.color} 総合スコア: ${overallScore}/100 (${grade.grade}グレード)`);
    console.log(`📈 評価: ${grade.status}`);
    
    console.log('\n📋 詳細指標:');
    console.log(`  LCP (Largest Contentful Paint): ${metrics.LCP.toFixed(0)}ms (${scores.LCP}/100)`);
    console.log(`  FCP (First Contentful Paint): ${metrics.FCP.toFixed(0)}ms (${scores.FCP}/100)`);
    console.log(`  TTI (Time to Interactive): ${metrics.TTI.toFixed(0)}ms (${scores.TTI}/100)`);
    console.log(`  TBT (Total Blocking Time): ${metrics.TBT.toFixed(0)}ms (${scores.TBT}/100)`);
    console.log(`  応答時間: ${metrics.responseTime}ms (${scores.responseTime}/100)`);
    if (pageSize) {
      console.log(`  ページサイズ: ${pageSize.toFixed(2)}KB (${scores.pageSize}/100)`);
    }
    
    // 改善提案
    console.log('\n💡 改善提案:');
    if (scores.LCP < 75) {
      console.log('  - LCP改善: 画像最適化、Critical CSS、プリロード実装');
    }
    if (scores.responseTime < 75) {
      console.log('  - 応答時間改善: CDN活用、キャッシュ最適化、API最適化');
    }
    if (scores.pageSize < 75) {
      console.log('  - ページサイズ削減: JavaScript/CSS圧縮、画像最適化');
    }
    if (scores.TBT < 75) {
      console.log('  - ブロッキング時間削減: コード分割、非同期処理改善');
    }
    
    return {
      pageName,
      url,
      overallScore,
      grade: grade.grade,
      status: grade.status,
      metrics,
      scores,
      contentType,
      success: true
    };
    
  } catch (error) {
    console.log(`❌ 評価失敗: ${error.message}`);
    return {
      pageName,
      url,
      success: false,
      error: error.message
    };
  }
}

// Bundle Size 分析
async function analyzeBundleSize() {
  console.log('\n=== Bundle Size 分析 ===');
  
  const jsFiles = [
    '/_next/static/chunks/main.js',
    '/_next/static/chunks/pages/_app.js',
    '/_next/static/chunks/webpack.js'
  ];
  
  let totalSize = 0;
  const results = [];
  
  for (const file of jsFiles) {
    try {
      const response = await fetch(`${BASE_URL}${file}`);
      if (response.ok) {
        const size = parseInt(response.headers.get('content-length') || '0') / 1024;
        totalSize += size;
        results.push({ file, size: size.toFixed(2) + ' KB' });
        console.log(`📦 ${file}: ${size.toFixed(2)} KB`);
      }
    } catch (error) {
      // ファイルが存在しない場合はスキップ
    }
  }
  
  console.log(`📊 推定総Bundle Size: ${totalSize.toFixed(2)} KB`);
  
  const bundleGrade = getGrade(calculateScore(totalSize, 'pageSize'));
  console.log(`${bundleGrade.color} Bundle評価: ${bundleGrade.status}`);
  
  return { totalSize, results };
}

// メイン実行
async function main() {
  console.log('🚀 Lighthouse風パフォーマンス評価開始');
  console.log(`🌐 対象サイト: ${BASE_URL}`);
  console.log('========================================');
  
  const testPages = [
    { name: 'トップページ', url: `${BASE_URL}/` },
    { name: '東京詳細ページ', url: `${BASE_URL}/wbgt/44132` },
    { name: '大阪詳細ページ', url: `${BASE_URL}/wbgt/62078` }
  ];
  
  const results = [];
  
  for (const page of testPages) {
    const result = await evaluatePage(page.url, page.name);
    if (result.success) {
      results.push(result);
    }
  }
  
  // Bundle分析
  const bundleAnalysis = await analyzeBundleSize();
  
  // 総合レポート
  console.log('\n=== 総合評価レポート ===');
  
  if (results.length > 0) {
    const avgScore = Math.round(
      results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
    );
    const overallGrade = getGrade(avgScore);
    
    console.log(`\n${overallGrade.color} サイト総合スコア: ${avgScore}/100 (${overallGrade.grade}グレード)`);
    
    // ページ別スコア一覧
    console.log('\n📋 ページ別スコア:');
    results.forEach(result => {
      const grade = getGrade(result.overallScore);
      console.log(`  ${grade.color} ${result.pageName}: ${result.overallScore}/100`);
    });
    
    // 改善優先度
    console.log('\n🎯 改善優先度:');
    const sortedPages = results.sort((a, b) => a.overallScore - b.overallScore);
    sortedPages.forEach((result, index) => {
      if (result.overallScore < 75) {
        console.log(`  ${index + 1}. ${result.pageName} (${result.overallScore}/100)`);
      }
    });
  }
  
  // レポート保存
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    pages: results,
    bundleAnalysis,
    summary: results.length > 0 ? {
      averageScore: Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length),
      bestPage: results.reduce((best, r) => r.overallScore > best.overallScore ? r : best),
      worstPage: results.reduce((worst, r) => r.overallScore < worst.overallScore ? r : worst)
    } : null
  };
  
  const reportDir = path.join(process.cwd(), 'test-results');
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, 'lighthouse-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📋 詳細レポート: ${reportPath}`);
  console.log('\n✅ パフォーマンス評価完了');
}

if (require.main === module) {
  main().catch(console.error);
}