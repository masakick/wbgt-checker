/**
 * OGPタグとSNSシェア情報確認スクリプト
 */

const https = require('https');

function fetchOGPTags(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // OGPタグを抽出
        const ogTags = {};
        const metaMatches = data.match(/<meta[^>]*property=[\"']og:[^\"']*[\"'][^>]*>/g) || [];
        
        metaMatches.forEach(tag => {
          const propertyMatch = tag.match(/property=[\"']og:([^\"']*)[\"']/);
          const contentMatch = tag.match(/content=[\"']([^\"']*)[\"']/);
          
          if (propertyMatch && contentMatch) {
            ogTags[propertyMatch[1]] = contentMatch[1];
          }
        });
        
        // Twitterタグも抽出
        const twitterMatches = data.match(/<meta[^>]*name=[\"']twitter:[^\"']*[\"'][^>]*>/g) || [];
        
        twitterMatches.forEach(tag => {
          const nameMatch = tag.match(/name=[\"']twitter:([^\"']*)[\"']/);
          const contentMatch = tag.match(/content=[\"']([^\"']*)[\"']/);
          
          if (nameMatch && contentMatch) {
            ogTags[`twitter:${nameMatch[1]}`] = contentMatch[1];
          }
        });
        
        resolve(ogTags);
      });
    }).on('error', reject);
  });
}

async function checkOGP() {
  console.log('🔍 SNSシェア用OGPタグ確認');
  console.log('');
  
  // 1. トップページ
  console.log('📍 トップページ (https://www.atsusa.jp)');
  try {
    const topOGP = await fetchOGPTags('https://www.atsusa.jp');
    console.log('OG Title:', topOGP.title || '❌ なし');
    console.log('OG Description:', topOGP.description || '❌ なし');
    console.log('OG Image:', topOGP.image || '❌ なし');
    console.log('OG URL:', topOGP.url || '❌ なし');
    console.log('Twitter Card:', topOGP['twitter:card'] || '❌ なし');
    console.log('');
  } catch (error) {
    console.log('❌ エラー:', error.message);
    console.log('');
  }
  
  // 2. 地点詳細ページ（東京）
  console.log('📍 地点詳細ページ（東京）');
  try {
    const tokyoOGP = await fetchOGPTags('https://www.atsusa.jp/wbgt/44132');
    console.log('OG Title:', tokyoOGP.title || '❌ なし');
    console.log('OG Description:', tokyoOGP.description || '❌ なし');
    console.log('OG Image:', tokyoOGP.image || '❌ なし');
    console.log('OG URL:', tokyoOGP.url || '❌ なし');
    console.log('Twitter Card:', tokyoOGP['twitter:card'] || '❌ なし');
    console.log('');
  } catch (error) {
    console.log('❌ エラー:', error.message);
    console.log('');
  }
  
  // 3. OG画像の確認
  console.log('📍 OG画像ファイル確認');
  try {
    const imageResponse = await new Promise((resolve, reject) => {
      https.get('https://www.atsusa.jp/og-image.svg', (res) => {
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: res.headers['content-length']
        });
      }).on('error', reject);
    });
    
    console.log('OG画像ステータス:', imageResponse.statusCode === 200 ? '✅ 200 OK' : `❌ ${imageResponse.statusCode}`);
    console.log('Content-Type:', imageResponse.contentType);
    console.log('Content-Length:', imageResponse.contentLength, 'bytes');
  } catch (error) {
    console.log('❌ OG画像エラー:', error.message);
  }
  
  console.log('');
  console.log('✨ チェック完了');
}

checkOGP().catch(console.error);