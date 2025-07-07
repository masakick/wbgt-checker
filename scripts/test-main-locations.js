#!/usr/bin/env node

/**
 * 主要地点のアクセステスト（簡易版）
 */

const BASE_URL = 'http://localhost:3000';

// テスト対象の主要地点
const testLocations = [
  // 各地方の主要都市
  { code: '14163', name: '札幌' },
  { code: '31312', name: '仙台' },
  { code: '44132', name: '東京' },
  { code: '51106', name: '名古屋' },
  { code: '62078', name: '大阪' },
  { code: '82182', name: '福岡' },
  { code: '91197', name: '那覇' },
  
  // リダイレクトテスト用
  { code: '41171', name: '廃止地点（リダイレクトテスト）' },
  { code: '45147', name: 'コード変更（45146へリダイレクト）' },
  { code: '74181', name: 'コード変更（74186へリダイレクト）' },
  { code: '88836', name: 'コード変更（88841へリダイレクト）' },
  
  // 各地方から追加サンプル
  { code: '21323', name: '青森' },
  { code: '55091', name: '新潟' },
  { code: '57066', name: '金沢' },
  { code: '64036', name: '広島' },
  { code: '54012', name: '松江' },
  { code: '73166', name: '高松' },
  { code: '42251', name: '長崎' },
  { code: '94081', name: '石垣島' }
];

// 地点をテスト
async function testLocation(location) {
  const url = `${BASE_URL}/wbgt/${location.code}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual'
    });
    
    if (response.status === 200) {
      return { ...location, status: '✅ OK', details: '' };
    } else if (response.status === 307 || response.status === 308) {
      const redirectTo = response.headers.get('location');
      return { ...location, status: '↪️ リダイレクト', details: `→ ${redirectTo}` };
    } else if (response.status === 404) {
      return { ...location, status: '❌ 404', details: 'ページが見つかりません' };
    } else {
      return { ...location, status: '⚠️ エラー', details: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { ...location, status: '❌ 接続エラー', details: error.message };
  }
}

// メイン処理
async function main() {
  console.log('🔍 主要地点アクセステストを開始します...\n');
  console.log('テスト対象: ' + testLocations.length + '地点\n');
  
  const results = [];
  
  // 順次テスト実行
  for (const location of testLocations) {
    process.stdout.write(`テスト中: ${location.code} (${location.name})... `);
    const result = await testLocation(location);
    results.push(result);
    console.log(result.status + ' ' + result.details);
    
    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // サマリー表示
  console.log('\n📊 テスト結果サマリー:');
  console.log('========================');
  
  const success = results.filter(r => r.status === '✅ OK').length;
  const redirect = results.filter(r => r.status.includes('リダイレクト')).length;
  const error = results.filter(r => r.status.includes('❌') || r.status.includes('⚠️')).length;
  
  console.log(`✅ 成功: ${success}/${testLocations.length}`);
  console.log(`↪️ リダイレクト: ${redirect}`);
  console.log(`❌ エラー: ${error}`);
  
  // エラー詳細
  const errors = results.filter(r => r.status.includes('❌') || r.status.includes('⚠️'));
  if (errors.length > 0) {
    console.log('\n⚠️ エラー詳細:');
    errors.forEach(e => {
      console.log(`  ${e.code} (${e.name}): ${e.status} ${e.details}`);
    });
  }
  
  console.log('\n✨ テスト完了');
}

// 実行
main().catch(console.error);