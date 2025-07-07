#!/usr/bin/env node

/**
 * 全841地点のページアクセステスト
 */

// TypeScriptファイルをrequireするためts-nodeを使用
require('ts-node/register');
const { getAllCompleteLocations } = require('../src/lib/complete-locations.ts');

const BASE_URL = 'http://localhost:3000';
const CONCURRENT_REQUESTS = 10; // 同時リクエスト数
const DELAY_MS = 100; // リクエスト間の遅延

// テスト結果を格納
const results = {
  total: 0,
  success: 0,
  redirect: 0,
  notFound: 0,
  error: 0,
  details: []
};

// 地点をテスト
async function testLocation(location) {
  const url = `${BASE_URL}/wbgt/${location.code}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual' // リダイレクトを手動で処理
    });
    
    if (response.status === 200) {
      results.success++;
      return { code: location.code, name: location.name, status: 'success' };
    } else if (response.status === 307 || response.status === 308) {
      results.redirect++;
      const redirectTo = response.headers.get('location');
      return { code: location.code, name: location.name, status: 'redirect', redirectTo };
    } else if (response.status === 404) {
      results.notFound++;
      return { code: location.code, name: location.name, status: 'notFound' };
    } else {
      results.error++;
      return { code: location.code, name: location.name, status: 'error', httpStatus: response.status };
    }
  } catch (error) {
    results.error++;
    return { code: location.code, name: location.name, status: 'error', error: error.message };
  }
}

// バッチ処理
async function processBatch(locations) {
  const promises = locations.map(location => testLocation(location));
  return Promise.all(promises);
}

// メイン処理
async function main() {
  console.log('🔍 全地点アクセステストを開始します...\n');
  
  const allLocations = getAllCompleteLocations();
  results.total = allLocations.length;
  
  console.log(`総地点数: ${results.total}`);
  console.log(`同時リクエスト数: ${CONCURRENT_REQUESTS}`);
  console.log(`リクエスト間隔: ${DELAY_MS}ms\n`);
  
  // プログレスバー用
  let processed = 0;
  
  // バッチ処理
  for (let i = 0; i < allLocations.length; i += CONCURRENT_REQUESTS) {
    const batch = allLocations.slice(i, i + CONCURRENT_REQUESTS);
    const batchResults = await processBatch(batch);
    
    // エラーやリダイレクトの詳細を記録
    batchResults.forEach(result => {
      if (result.status !== 'success') {
        results.details.push(result);
      }
    });
    
    processed += batch.length;
    
    // プログレス表示
    const progress = Math.floor((processed / results.total) * 100);
    process.stdout.write(`\rテスト進行状況: ${progress}% (${processed}/${results.total})`);
    
    // 次のバッチまで待機
    if (i + CONCURRENT_REQUESTS < allLocations.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  console.log('\n\n📊 テスト結果サマリー:');
  console.log('========================');
  console.log(`✅ 成功: ${results.success}/${results.total}`);
  console.log(`↪️  リダイレクト: ${results.redirect}`);
  console.log(`❌ 404エラー: ${results.notFound}`);
  console.log(`⚠️  その他エラー: ${results.error}`);
  
  if (results.details.length > 0) {
    console.log('\n📋 エラー/リダイレクト詳細:');
    console.log('==========================');
    
    // リダイレクト
    const redirects = results.details.filter(d => d.status === 'redirect');
    if (redirects.length > 0) {
      console.log('\n↪️  リダイレクト:');
      redirects.forEach(r => {
        console.log(`  ${r.code} (${r.name}) → ${r.redirectTo}`);
      });
    }
    
    // 404エラー
    const notFounds = results.details.filter(d => d.status === 'notFound');
    if (notFounds.length > 0) {
      console.log('\n❌ 404エラー:');
      notFounds.forEach(r => {
        console.log(`  ${r.code} (${r.name})`);
      });
    }
    
    // その他のエラー
    const errors = results.details.filter(d => d.status === 'error');
    if (errors.length > 0) {
      console.log('\n⚠️  その他のエラー:');
      errors.forEach(r => {
        console.log(`  ${r.code} (${r.name}): ${r.error || `HTTP ${r.httpStatus}`}`);
      });
    }
  }
  
  // 成功率
  const successRate = ((results.success + results.redirect) / results.total * 100).toFixed(2);
  console.log(`\n✨ 成功率: ${successRate}%`);
  
  // 終了コード
  process.exit(results.error > 0 || results.notFound > 0 ? 1 : 0);
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('\n❗ エラーが発生しました:', error);
  process.exit(1);
});

// 実行
main().catch(console.error);