#!/usr/bin/env node

/**
 * OGP画像生成とサイトマップの動作確認スクリプト
 * 
 * 使用方法:
 * 1. 開発サーバーを起動: npm run dev
 * 2. 別ターミナルで実行: node scripts/test-og-sitemap.js
 */

const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// テスト結果を格納
const results = {
  ogp: {
    success: 0,
    failed: 0,
    tests: []
  },
  sitemap: {
    success: false,
    totalUrls: 0,
    hasDynamicPages: false,
    errors: []
  }
};

// 静的OGP画像テスト
async function testOGPGeneration() {
  console.log('\n=== 静的OGP画像テスト ===\n');
  
  const testCases = [
    {
      name: 'SVG OGP画像',
      url: `${BASE_URL}/og-image.svg`,
      expected: 'SVG画像の提供'
    },
    {
      name: 'PNG OGP画像（fallback）',
      url: `${BASE_URL}/og-image.png`,
      expected: 'PNG画像の提供（存在する場合）'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`テスト: ${testCase.name}`);
    console.log(`URL: ${testCase.url}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(testCase.url);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        if (contentType && (contentType.includes('image') || contentType.includes('svg'))) {
          console.log(`✅ 成功: ${testCase.expected}`);
          console.log(`   - Content-Type: ${contentType}`);
          console.log(`   - Size: ${contentLength ? (parseInt(contentLength) / 1024).toFixed(2) + ' KB' : 'N/A'}`);
          console.log(`   - Response Time: ${responseTime}ms`);
          
          results.ogp.success++;
          results.ogp.tests.push({
            name: testCase.name,
            status: 'success',
            details: {
              contentType,
              size: contentLength,
              responseTime
            }
          });
        } else {
          throw new Error(`Invalid content type: ${contentType}`);
        }
      } else {
        console.log(`ℹ️  スキップ: ${testCase.name} (${response.status})`);
        if (testCase.name.includes('PNG')) {
          console.log('   - PNGファイルが存在しない場合は正常です');
        }
      }
    } catch (error) {
      console.log(`❌ 失敗: ${error.message}`);
      results.ogp.failed++;
      results.ogp.tests.push({
        name: testCase.name,
        status: 'failed',
        error: error.message
      });
    }
    console.log('');
  }
}

// サイトマップ生成テスト
async function testSitemap() {
  console.log('\n=== サイトマップ生成テスト ===\n');
  
  const url = `${BASE_URL}/sitemap.xml`;
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (response.ok) {
      const xml = await response.text();
      
      // XMLの基本的な検証
      if (!xml.includes('<?xml') || !xml.includes('<urlset')) {
        throw new Error('Invalid XML format');
      }
      
      // URL数のカウント
      const urlMatches = xml.match(/<url>/g);
      const totalUrls = urlMatches ? urlMatches.length : 0;
      
      // 動的ページの確認（/wbgt/で始まるURL）
      const dynamicPageMatches = xml.match(/<loc>[^<]*\/wbgt\/\d+<\/loc>/g);
      const dynamicPageCount = dynamicPageMatches ? dynamicPageMatches.length : 0;
      
      console.log(`✅ サイトマップ生成成功`);
      console.log(`   - 総URL数: ${totalUrls}`);
      console.log(`   - 動的ページ数: ${dynamicPageCount}`);
      console.log(`   - 静的ページ数: ${totalUrls - dynamicPageCount}`);
      
      // 840地点の確認
      const expected840 = totalUrls >= 840;
      console.log(`   - 840地点対応: ${expected840 ? '✅' : '❌'} (${totalUrls - 1}地点)`);
      
      // いくつかのURLサンプルを表示
      const locMatches = xml.match(/<loc>([^<]+)<\/loc>/g);
      if (locMatches) {
        console.log('\n   サンプルURL:');
        locMatches.slice(0, 5).forEach(loc => {
          const url = loc.replace(/<\/?loc>/g, '');
          console.log(`   - ${url}`);
        });
        if (locMatches.length > 5) {
          console.log(`   ... 他 ${locMatches.length - 5} URL`);
        }
      }
      
      results.sitemap.success = true;
      results.sitemap.totalUrls = totalUrls;
      results.sitemap.hasDynamicPages = dynamicPageCount > 0;
      
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ 失敗: ${error.message}`);
    results.sitemap.errors.push(error.message);
  }
}

// メタデータの確認
async function testPageMetadata() {
  console.log('\n=== ページメタデータ確認 ===\n');
  
  const testPages = [
    { url: BASE_URL, name: 'トップページ' },
    { url: `${BASE_URL}/wbgt/44132`, name: '東京の詳細ページ' },
    { url: `${BASE_URL}/wbgt/62078`, name: '大阪の詳細ページ' }
  ];
  
  for (const page of testPages) {
    console.log(`\n${page.name}: ${page.url}`);
    
    try {
      const response = await fetch(page.url);
      if (response.ok) {
        const html = await response.text();
        
        // OGPタグの確認
        const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/);
        const ogDescription = html.match(/<meta property="og:description" content="([^"]+)"/);
        const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
        
        console.log('OGPタグ:');
        console.log(`  - og:title: ${ogTitle ? ogTitle[1] : '❌ なし'}`);
        console.log(`  - og:description: ${ogDescription ? ogDescription[1].substring(0, 50) + '...' : '❌ なし'}`);
        console.log(`  - og:image: ${ogImage ? '✅ あり' : '❌ なし'}`);
        
        if (ogImage && ogImage[1]) {
          console.log(`    URL: ${ogImage[1]}`);
        }
      }
    } catch (error) {
      console.log(`❌ エラー: ${error.message}`);
    }
  }
}

// レポート生成
async function generateReport() {
  console.log('\n=== テスト結果サマリー ===\n');
  
  console.log('OGP画像生成:');
  console.log(`  - 成功: ${results.ogp.success}/${results.ogp.tests.length}`);
  console.log(`  - 失敗: ${results.ogp.failed}`);
  
  console.log('\nサイトマップ:');
  console.log(`  - 生成: ${results.sitemap.success ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`  - 総URL数: ${results.sitemap.totalUrls}`);
  console.log(`  - 840地点対応: ${results.sitemap.totalUrls >= 841 ? '✅' : '❌'}`);
  
  // レポートファイル生成
  const reportPath = path.join(process.cwd(), 'test-results', 'og-sitemap-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n詳細レポート: ${reportPath}`);
}

// メイン実行
async function main() {
  console.log('OGP画像・サイトマップ生成確認テスト開始');
  console.log(`ベースURL: ${BASE_URL}`);
  console.log('========================================');
  
  try {
    // 各テストを実行
    await testOGPGeneration();
    await testSitemap();
    await testPageMetadata();
    
    // レポート生成
    await generateReport();
    
    // 終了コード
    const allPassed = results.ogp.failed === 0 && results.sitemap.success;
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('\n予期しないエラー:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}