/**
 * 本番環境の動作確認スクリプト
 * atsusa.jpの主要機能をテスト
 */

const https = require('https');

const SITE_URL = 'https://www.atsusa.jp';
const TEST_LOCATIONS = [
  { code: '44132', name: '東京' },
  { code: '62078', name: '大阪' },
  { code: '51106', name: '名古屋' },
  { code: '82182', name: '福岡' },
  { code: '14163', name: '札幌' },
  { code: '91197', name: '那覇' }
];

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          contentLength: data.length
        });
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function runTests() {
  console.log('🚀 本番環境動作テスト開始');
  console.log(`URL: ${SITE_URL}`);
  console.log('---');
  
  // 1. トップページテスト
  console.log('📍 トップページテスト');
  const topPage = await checkUrl(SITE_URL);
  console.log(`ステータス: ${topPage.statusCode === 200 ? '✅' : '❌'} ${topPage.statusCode}`);
  console.log(`コンテンツサイズ: ${topPage.contentLength} bytes`);
  console.log('');
  
  // 2. 地点詳細ページテスト
  console.log('📍 地点詳細ページテスト');
  for (const location of TEST_LOCATIONS) {
    const url = `${SITE_URL}/wbgt/${location.code}`;
    const result = await checkUrl(url);
    const status = result.statusCode === 200 ? '✅' : '❌';
    console.log(`${location.name} (${location.code}): ${status} ${result.statusCode || result.error}`);
  }
  console.log('');
  
  // 3. API エンドポイントテスト
  console.log('📍 APIエンドポイントテスト');
  const endpoints = [
    { name: 'Health Check', url: `${SITE_URL}/api/health` },
    { name: 'Sitemap', url: `${SITE_URL}/sitemap.xml` },
    { name: 'OG Image', url: `${SITE_URL}/og-image.svg` },
    { name: 'Manifest', url: `${SITE_URL}/manifest.json` },
    { name: 'Service Worker', url: `${SITE_URL}/sw.js` }
  ];
  
  for (const endpoint of endpoints) {
    const result = await checkUrl(endpoint.url);
    const status = result.statusCode === 200 ? '✅' : '❌';
    console.log(`${endpoint.name}: ${status} ${result.statusCode || result.error}`);
  }
  console.log('');
  
  // 4. リダイレクトテスト
  console.log('📍 リダイレクトテスト');
  const redirectTests = [
    { from: 'https://atsusa.jp', to: 'https://www.atsusa.jp/', desc: 'non-www → www' },
    { from: `${SITE_URL}/wbgt/41171`, to: '/', desc: '廃止地点 → トップ' }
  ];
  
  for (const test of redirectTests) {
    const result = await checkUrl(test.from);
    const isRedirect = result.statusCode === 307 || result.statusCode === 308;
    const status = isRedirect ? '✅' : '❌';
    console.log(`${test.desc}: ${status} ${result.statusCode}`);
  }
  
  console.log('');
  console.log('✨ テスト完了');
}

runTests().catch(console.error);