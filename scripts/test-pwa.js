/**
 * PWAインストール機能テストスクリプト
 * 本番環境でのPWA機能を包括的にテスト
 */

const BASE_URL = 'https://wbgt-checker.vercel.app'

// テスト対象のエンドポイント
const TEST_ENDPOINTS = [
  { url: `${BASE_URL}/manifest.json`, name: 'メインマニフェスト' },
  { url: `${BASE_URL}/sw.js`, name: 'サービスワーカー' },
  { url: `${BASE_URL}/api/manifest/44132`, name: '動的マニフェスト（東京）' },
  { url: `${BASE_URL}/api/manifest/62078`, name: '動的マニフェスト（大阪）' },
  { url: `${BASE_URL}/api/manifest/14163`, name: '動的マニフェスト（札幌）' },
  { url: `${BASE_URL}/icons/icon-192x192.png`, name: 'PWAアイコン 192x192' },
  { url: `${BASE_URL}/icons/icon-512x512.png`, name: 'PWAアイコン 512x512' }
]

// テスト実行
async function runPWATests() {
  console.log('🚀 PWAインストール機能テスト開始')
  console.log('=' .repeat(50))
  
  const results = []
  
  for (const endpoint of TEST_ENDPOINTS) {
    try {
      const response = await fetch(endpoint.url)
      const status = response.status
      const contentType = response.headers.get('content-type')
      
      let testResult = {
        name: endpoint.name,
        url: endpoint.url,
        status: status,
        success: status >= 200 && status < 300,
        contentType: contentType,
        details: ''
      }
      
      // マニフェストファイルの場合は内容をチェック
      if (endpoint.url.includes('manifest')) {
        try {
          const manifestData = await response.json()
          testResult.details = `name: ${manifestData.name}, start_url: ${manifestData.start_url}`
        } catch (e) {
          testResult.details = 'JSON解析エラー'
          testResult.success = false
        }
      }
      
      // サービスワーカーの場合は内容をチェック
      if (endpoint.url.includes('sw.js')) {
        try {
          const swContent = await response.text()
          const hasCacheName = swContent.includes('CACHE_NAME')
          const hasInstallEvent = swContent.includes("addEventListener('install'")
          testResult.details = `キャッシュ名: ${hasCacheName}, インストールイベント: ${hasInstallEvent}`
        } catch (e) {
          testResult.details = 'テキスト解析エラー'
          testResult.success = false
        }
      }
      
      results.push(testResult)
      
      console.log(`${testResult.success ? '✅' : '❌'} ${testResult.name}`)
      console.log(`   URL: ${testResult.url}`)
      console.log(`   ステータス: ${testResult.status}`)
      console.log(`   Content-Type: ${testResult.contentType}`)
      if (testResult.details) {
        console.log(`   詳細: ${testResult.details}`)
      }
      console.log()
      
    } catch (error) {
      const errorResult = {
        name: endpoint.name,
        url: endpoint.url,
        status: 'ERROR',
        success: false,
        contentType: 'N/A',
        details: error.message
      }
      
      results.push(errorResult)
      
      console.log(`❌ ${errorResult.name}`)
      console.log(`   URL: ${errorResult.url}`)
      console.log(`   エラー: ${errorResult.details}`)
      console.log()
    }
  }
  
  // 結果サマリー
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  const successRate = ((successCount / totalCount) * 100).toFixed(1)
  
  console.log('=' .repeat(50))
  console.log('📊 PWAテスト結果サマリー')
  console.log(`成功: ${successCount}/${totalCount} (${successRate}%)`)
  console.log()
  
  // 失敗したテストの詳細
  const failedTests = results.filter(r => !r.success)
  if (failedTests.length > 0) {
    console.log('❌ 失敗したテスト:')
    failedTests.forEach(test => {
      console.log(`   - ${test.name}: ${test.status} (${test.details})`)
    })
    console.log()
  }
  
  // PWAインストール判定
  const manifestOK = results.find(r => r.name === 'メインマニフェスト')?.success
  const swOK = results.find(r => r.name === 'サービスワーカー')?.success
  const iconsOK = results.filter(r => r.name.includes('PWAアイコン')).every(r => r.success)
  
  console.log('🔍 PWAインストール要件チェック:')
  console.log(`   マニフェスト: ${manifestOK ? '✅' : '❌'}`)
  console.log(`   サービスワーカー: ${swOK ? '✅' : '❌'}`)
  console.log(`   アイコン: ${iconsOK ? '✅' : '❌'}`)
  
  const pwaReady = manifestOK && swOK && iconsOK
  console.log(`   PWAインストール準備: ${pwaReady ? '✅ 完了' : '❌ 未完了'}`)
  console.log()
  
  // 詳細ページ用動的マニフェストの確認
  const dynamicManifests = results.filter(r => r.name.includes('動的マニフェスト'))
  const dynamicOK = dynamicManifests.every(r => r.success)
  console.log(`🔗 動的マニフェスト（詳細ページ用）: ${dynamicOK ? '✅ 正常' : '❌ 問題あり'}`)
  
  if (!dynamicOK) {
    console.log('   失敗した動的マニフェスト:')
    dynamicManifests.filter(r => !r.success).forEach(test => {
      console.log(`   - ${test.name}: ${test.status}`)
    })
  }
  
  console.log()
  console.log('📱 手動確認推奨事項:')
  console.log('   1. Chrome/Edge: デベロッパーツール > Application > Manifest')
  console.log('   2. Safari: 詳細ページで「ホーム画面に追加」が詳細ページを保存するか')
  console.log('   3. Chrome: アドレスバーのインストールアイコンが表示されるか')
  console.log('   4. PWAインストール後のアプリアイコンとスプラッシュスクリーン')
  
  return {
    totalTests: totalCount,
    successfulTests: successCount,
    successRate: successRate,
    pwaReady: pwaReady,
    failedTests: failedTests
  }
}

// Node.js環境で実行
if (typeof require !== 'undefined') {
  // Node.js環境
  const fetch = require('node-fetch')
  runPWATests().then(results => {
    console.log('\n🎯 テスト完了')
    process.exit(results.pwaReady ? 0 : 1)
  }).catch(error => {
    console.error('❌ テスト実行エラー:', error)
    process.exit(1)
  })
} else {
  // ブラウザ環境
  runPWATests().then(results => {
    console.log('🎯 テスト完了')
  })
}