#!/usr/bin/env node

/**
 * 1週間試験運用・安定性監視スクリプト
 * 
 * 使用方法:
 * 1. 本番環境デプロイ後に実行
 * 2. 24時間×7日間の連続監視
 * 3. 毎時自動チェックと詳細ログ記録
 * 
 * BASE_URL=https://your-domain.com node scripts/stability-monitor.js
 */

const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

// 設定
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CHECK_INTERVAL = 60 * 60 * 1000; // 1時間ごと
const TOTAL_DURATION = 7 * 24 * 60 * 60 * 1000; // 7日間
const ALERT_THRESHOLD = {
  responseTime: 5000, // 5秒
  errorRate: 0.1, // 10%
  downtime: 3 // 3回連続失敗
};

// 監視対象
const MONITOR_ENDPOINTS = [
  { name: 'トップページ', url: `${BASE_URL}/`, critical: true },
  { name: '東京詳細ページ', url: `${BASE_URL}/wbgt/44132`, critical: true },
  { name: '大阪詳細ページ', url: `${BASE_URL}/wbgt/62078`, critical: true },
  { name: '札幌詳細ページ', url: `${BASE_URL}/wbgt/11001`, critical: false },
  { name: 'サイトマップ', url: `${BASE_URL}/sitemap.xml`, critical: false },
  { name: 'PWAマニフェスト', url: `${BASE_URL}/manifest.json`, critical: false },
  { name: 'OGP画像', url: `${BASE_URL}/og-image.svg`, critical: false },
  { name: 'About ページ', url: `${BASE_URL}/about`, critical: false }
];

// データソース監視
const DATA_SOURCES = [
  { name: 'WBGT データ', url: 'https://masaki-yamabe.sakura.ne.jp/atsusa/data/wbgt.csv' },
  { name: '気温データ', url: 'https://masaki-yamabe.sakura.ne.jp/atsusa/data/temp.json' },
  { name: '予報データ', url: 'https://masaki-yamabe.sakura.ne.jp/atsusa/data/forecast.csv' }
];

// 監視結果格納
const monitoringData = {
  startTime: new Date().toISOString(),
  totalChecks: 0,
  uptime: 0,
  downtime: 0,
  endpoints: {},
  dataSources: {},
  alerts: [],
  dailyReports: [],
  summary: {
    averageResponseTime: 0,
    errorRate: 0,
    availability: 0,
    criticalErrors: 0
  }
};

// 各エンドポイントの初期化
MONITOR_ENDPOINTS.forEach(endpoint => {
  monitoringData.endpoints[endpoint.name] = {
    url: endpoint.url,
    critical: endpoint.critical,
    checks: 0,
    successes: 0,
    failures: 0,
    consecutiveFailures: 0,
    avgResponseTime: 0,
    responseTimes: [],
    lastCheck: null,
    lastError: null,
    status: 'unknown'
  };
});

DATA_SOURCES.forEach(source => {
  monitoringData.dataSources[source.name] = {
    url: source.url,
    checks: 0,
    successes: 0,
    failures: 0,
    avgResponseTime: 0,
    lastCheck: null,
    lastError: null,
    status: 'unknown'
  };
});

// 単一エンドポイントチェック
async function checkEndpoint(endpoint) {
  const startTime = performance.now();
  const data = monitoringData.endpoints[endpoint.name];
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト
    
    const response = await fetch(endpoint.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WBGT-Monitor/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    data.checks++;
    data.lastCheck = new Date().toISOString();
    data.responseTimes.push(responseTime);
    
    // 直近100回の平均を保持
    if (data.responseTimes.length > 100) {
      data.responseTimes.shift();
    }
    
    data.avgResponseTime = Math.round(
      data.responseTimes.reduce((sum, time) => sum + time, 0) / data.responseTimes.length
    );
    
    if (response.ok) {
      data.successes++;
      data.consecutiveFailures = 0;
      data.status = 'up';
      data.lastError = null;
      
      // 遅延アラート
      if (responseTime > ALERT_THRESHOLD.responseTime) {
        addAlert('warning', `${endpoint.name} が遅延しています (${responseTime}ms)`, endpoint);
      }
      
      return { success: true, responseTime, status: response.status };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    data.checks++;
    data.failures++;
    data.consecutiveFailures++;
    data.lastCheck = new Date().toISOString();
    data.lastError = error.message;
    data.status = 'down';
    
    // ダウンタイムアラート
    if (data.consecutiveFailures >= ALERT_THRESHOLD.downtime) {
      const severity = endpoint.critical ? 'critical' : 'warning';
      addAlert(severity, `${endpoint.name} が${data.consecutiveFailures}回連続で失敗`, endpoint);
    }
    
    return { success: false, responseTime, error: error.message };
  }
}

// データソースチェック
async function checkDataSource(source) {
  const startTime = performance.now();
  const data = monitoringData.dataSources[source.name];
  
  try {
    const response = await fetch(source.url, {
      headers: { 'User-Agent': 'WBGT-Monitor/1.0' }
    });
    
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    data.checks++;
    data.lastCheck = new Date().toISOString();
    
    if (response.ok) {
      data.successes++;
      data.status = 'up';
      data.lastError = null;
      
      // 平均応答時間更新
      data.avgResponseTime = Math.round(
        (data.avgResponseTime * (data.successes - 1) + responseTime) / data.successes
      );
      
      return { success: true, responseTime };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    data.failures++;
    data.lastError = error.message;
    data.status = 'down';
    
    addAlert('warning', `データソース ${source.name} が利用できません`, source);
    
    return { success: false, error: error.message };
  }
}

// アラート追加
function addAlert(severity, message, endpoint) {
  const alert = {
    timestamp: new Date().toISOString(),
    severity,
    message,
    endpoint: endpoint.name,
    url: endpoint.url
  };
  
  monitoringData.alerts.push(alert);
  
  // コンソール出力
  const emoji = severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${severity.toUpperCase()}] ${message}`);
  
  // 直近100件のアラートを保持
  if (monitoringData.alerts.length > 100) {
    monitoringData.alerts.shift();
  }
}

// 全チェック実行
async function runChecks() {
  console.log(`\n🔍 監視チェック実行中... (${new Date().toLocaleString('ja-JP')})`);
  
  const checkResults = {
    timestamp: new Date().toISOString(),
    endpoints: {},
    dataSources: {},
    summary: { total: 0, successes: 0, failures: 0 }
  };
  
  // エンドポイントチェック
  for (const endpoint of MONITOR_ENDPOINTS) {
    const result = await checkEndpoint(endpoint);
    checkResults.endpoints[endpoint.name] = result;
    checkResults.summary.total++;
    
    if (result.success) {
      checkResults.summary.successes++;
    } else {
      checkResults.summary.failures++;
    }
    
    // 進捗表示
    const status = result.success ? '✅' : '❌';
    const time = result.success ? `${result.responseTime}ms` : 'Failed';
    console.log(`  ${status} ${endpoint.name}: ${time}`);
  }
  
  // データソースチェック
  for (const source of DATA_SOURCES) {
    const result = await checkDataSource(source);
    checkResults.dataSources[source.name] = result;
    
    const status = result.success ? '✅' : '❌';
    const time = result.success ? `${result.responseTime}ms` : 'Failed';
    console.log(`  ${status} ${source.name}: ${time}`);
  }
  
  monitoringData.totalChecks++;
  
  // 統計更新
  updateStatistics();
  
  // チェック結果の成功率
  const successRate = (checkResults.summary.successes / checkResults.summary.total) * 100;
  console.log(`📊 成功率: ${successRate.toFixed(1)}% (${checkResults.summary.successes}/${checkResults.summary.total})`);
  
  return checkResults;
}

// 統計更新
function updateStatistics() {
  let totalChecks = 0;
  let totalSuccesses = 0;
  let totalResponseTime = 0;
  let criticalErrors = 0;
  
  Object.values(monitoringData.endpoints).forEach(endpoint => {
    totalChecks += endpoint.checks;
    totalSuccesses += endpoint.successes;
    totalResponseTime += endpoint.avgResponseTime * endpoint.checks;
    
    if (endpoint.critical && endpoint.status === 'down') {
      criticalErrors++;
    }
  });
  
  if (totalChecks > 0) {
    monitoringData.summary.availability = (totalSuccesses / totalChecks) * 100;
    monitoringData.summary.errorRate = ((totalChecks - totalSuccesses) / totalChecks) * 100;
    monitoringData.summary.averageResponseTime = Math.round(totalResponseTime / totalChecks);
    monitoringData.summary.criticalErrors = criticalErrors;
  }
}

// 日次レポート生成
function generateDailyReport() {
  const today = new Date().toISOString().split('T')[0];
  
  const report = {
    date: today,
    timestamp: new Date().toISOString(),
    totalChecks: monitoringData.totalChecks,
    availability: monitoringData.summary.availability,
    averageResponseTime: monitoringData.summary.averageResponseTime,
    errorRate: monitoringData.summary.errorRate,
    criticalErrors: monitoringData.summary.criticalErrors,
    alertsToday: monitoringData.alerts.filter(alert => 
      alert.timestamp.startsWith(today)
    ).length,
    endpoints: Object.keys(monitoringData.endpoints).map(name => ({
      name,
      status: monitoringData.endpoints[name].status,
      availability: monitoringData.endpoints[name].checks > 0 
        ? (monitoringData.endpoints[name].successes / monitoringData.endpoints[name].checks) * 100 
        : 0,
      avgResponseTime: monitoringData.endpoints[name].avgResponseTime
    }))
  };
  
  monitoringData.dailyReports.push(report);
  
  console.log(`\n📋 日次レポート (${today})`);
  console.log(`📈 稼働率: ${report.availability.toFixed(2)}%`);
  console.log(`⏱️ 平均応答時間: ${report.averageResponseTime}ms`);
  console.log(`❌ エラー率: ${report.errorRate.toFixed(2)}%`);
  console.log(`🚨 本日のアラート: ${report.alertsToday}件`);
  
  return report;
}

// レポート保存
async function saveReport() {
  const reportDir = path.join(process.cwd(), 'monitoring-reports');
  await fs.mkdir(reportDir, { recursive: true });
  
  // 詳細監視データ
  const detailPath = path.join(reportDir, 'monitoring-data.json');
  await fs.writeFile(detailPath, JSON.stringify(monitoringData, null, 2));
  
  // 日次サマリー
  const summaryPath = path.join(reportDir, 'daily-summary.json');
  await fs.writeFile(summaryPath, JSON.stringify(monitoringData.dailyReports, null, 2));
  
  // 最新ステータス
  const statusPath = path.join(reportDir, 'current-status.json');
  const currentStatus = {
    timestamp: new Date().toISOString(),
    uptime: new Date().getTime() - new Date(monitoringData.startTime).getTime(),
    summary: monitoringData.summary,
    recentAlerts: monitoringData.alerts.slice(-10),
    endpointStatus: Object.keys(monitoringData.endpoints).map(name => ({
      name,
      status: monitoringData.endpoints[name].status,
      lastCheck: monitoringData.endpoints[name].lastCheck,
      consecutiveFailures: monitoringData.endpoints[name].consecutiveFailures
    }))
  };
  await fs.writeFile(statusPath, JSON.stringify(currentStatus, null, 2));
}

// 最終レポート生成
async function generateFinalReport() {
  console.log('\n=== 1週間試験運用最終レポート ===');
  
  const duration = new Date().getTime() - new Date(monitoringData.startTime).getTime();
  const durationDays = Math.round(duration / (24 * 60 * 60 * 1000) * 10) / 10;
  
  console.log(`📅 監視期間: ${durationDays}日間`);
  console.log(`📊 総チェック数: ${monitoringData.totalChecks}`);
  console.log(`📈 総合稼働率: ${monitoringData.summary.availability.toFixed(2)}%`);
  console.log(`⏱️ 平均応答時間: ${monitoringData.summary.averageResponseTime}ms`);
  console.log(`❌ エラー率: ${monitoringData.summary.errorRate.toFixed(2)}%`);
  console.log(`🚨 重要エラー: ${monitoringData.summary.criticalErrors}件`);
  console.log(`📢 総アラート数: ${monitoringData.alerts.length}`);
  
  console.log('\n📋 エンドポイント別稼働率:');
  Object.keys(monitoringData.endpoints).forEach(name => {
    const endpoint = monitoringData.endpoints[name];
    const availability = endpoint.checks > 0 
      ? (endpoint.successes / endpoint.checks) * 100 
      : 0;
    const status = endpoint.critical ? '[重要]' : '[通常]';
    console.log(`  ${status} ${name}: ${availability.toFixed(2)}% (${endpoint.avgResponseTime}ms平均)`);
  });
  
  // 安定性評価
  console.log('\n🎯 安定性評価:');
  if (monitoringData.summary.availability >= 99.9) {
    console.log('  ✅ 非常に安定 (99.9%以上)');
  } else if (monitoringData.summary.availability >= 99.0) {
    console.log('  ✅ 安定 (99.0%以上)');
  } else if (monitoringData.summary.availability >= 95.0) {
    console.log('  ⚠️ やや不安定 (95.0%以上)');
  } else {
    console.log('  ❌ 不安定 (95.0%未満)');
  }
  
  if (monitoringData.summary.averageResponseTime <= 2000) {
    console.log('  ✅ 応答時間良好 (2秒以下)');
  } else if (monitoringData.summary.averageResponseTime <= 5000) {
    console.log('  ⚠️ 応答時間やや遅い (5秒以下)');
  } else {
    console.log('  ❌ 応答時間改善必要 (5秒超過)');
  }
  
  // 最終レポート保存
  const finalReport = {
    ...monitoringData,
    evaluation: {
      duration: durationDays,
      stability: monitoringData.summary.availability >= 99.0 ? 'stable' : 'unstable',
      performance: monitoringData.summary.averageResponseTime <= 2000 ? 'good' : 'needs_improvement',
      recommendation: monitoringData.summary.availability >= 99.0 && monitoringData.summary.averageResponseTime <= 2000 
        ? 'Ready for production' 
        : 'Requires improvement before production'
    }
  };
  
  const finalReportPath = path.join(process.cwd(), 'monitoring-reports', 'final-report.json');
  await fs.writeFile(finalReportPath, JSON.stringify(finalReport, null, 2));
  
  console.log(`\n📋 最終レポート: ${finalReportPath}`);
  
  return finalReport;
}

// メイン監視ループ
async function startMonitoring() {
  console.log('🚀 1週間試験運用・安定性監視開始');
  console.log(`🌐 監視対象: ${BASE_URL}`);
  console.log(`⏱️ チェック間隔: ${CHECK_INTERVAL / 60000}分`);
  console.log(`📅 監視期間: ${TOTAL_DURATION / (24 * 60 * 60 * 1000)}日間`);
  console.log('========================================');
  
  let checkCount = 0;
  let lastDailyReport = new Date().toISOString().split('T')[0];
  
  // 初回チェック
  await runChecks();
  await saveReport();
  
  // 監視ループ
  const interval = setInterval(async () => {
    checkCount++;
    
    try {
      await runChecks();
      await saveReport();
      
      // 日次レポート
      const today = new Date().toISOString().split('T')[0];
      if (today !== lastDailyReport) {
        generateDailyReport();
        lastDailyReport = today;
      }
      
      // 7日間経過チェック
      const elapsed = new Date().getTime() - new Date(monitoringData.startTime).getTime();
      if (elapsed >= TOTAL_DURATION) {
        clearInterval(interval);
        const finalReport = await generateFinalReport();
        
        console.log('\n✅ 1週間試験運用監視完了');
        
        // 推奨事項出力
        if (finalReport.evaluation.recommendation === 'Ready for production') {
          console.log('🎉 本番環境デプロイ準備完了！');
          process.exit(0);
        } else {
          console.log('⚠️ 改善後に再監視を推奨します');
          process.exit(1);
        }
      }
      
    } catch (error) {
      console.error('❌ 監視エラー:', error);
      addAlert('critical', `監視システムエラー: ${error.message}`, { name: 'Monitor', url: '' });
    }
    
  }, CHECK_INTERVAL);
  
  // 終了シグナル処理
  process.on('SIGINT', async () => {
    console.log('\n⏹️ 監視停止中...');
    clearInterval(interval);
    await generateFinalReport();
    console.log('✅ 監視データ保存完了');
    process.exit(0);
  });
}

// スクリプト実行
if (require.main === module) {
  startMonitoring().catch(console.error);
}