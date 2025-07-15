/**
 * DNS浸透監視スクリプト
 * atsusa.jpのDNS変更を監視し、新しい設定に切り替わったタイミングを検出
 */

const { exec } = require('child_process');

const TARGET_NS = ['ns1.value-domain.com', 'ns2.value-domain.com'];
const TARGET_A = '216.198.79.1';

function checkDNS() {
  return new Promise((resolve) => {
    const results = {};
    let completed = 0;
    
    // ネームサーバーチェック
    exec('dig NS atsusa.jp +short', (error, stdout) => {
      if (!error) {
        const nameservers = stdout.trim().split('\n').map(ns => ns.replace(/\.$/, ''));
        results.nameservers = nameservers;
        results.nsChanged = TARGET_NS.some(target => nameservers.includes(target));
      }
      completed++;
      if (completed === 2) resolve(results);
    });
    
    // Aレコードチェック
    exec('dig A atsusa.jp +short', (error, stdout) => {
      if (!error) {
        const aRecord = stdout.trim();
        results.aRecord = aRecord;
        results.aChanged = aRecord === TARGET_A;
      }
      completed++;
      if (completed === 2) resolve(results);
    });
  });
}

async function monitorDNS() {
  console.log('🔍 DNS浸透監視を開始します...');
  console.log(`目標ネームサーバー: ${TARGET_NS.join(', ')}`);
  console.log(`目標Aレコード: ${TARGET_A}`);
  console.log('---');
  
  let attempt = 1;
  const startTime = Date.now();
  
  while (true) {
    const results = await checkDNS();
    const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60);
    
    console.log(`[${new Date().toLocaleTimeString()}] 試行 ${attempt} (経過: ${elapsed}分)`);
    console.log(`NS: ${results.nameservers?.join(', ') || 'エラー'} ${results.nsChanged ? '✅' : '⏳'}`);
    console.log(`A:  ${results.aRecord || 'エラー'} ${results.aChanged ? '✅' : '⏳'}`);
    
    if (results.nsChanged && results.aChanged) {
      console.log('');
      console.log('🎉 DNS浸透完了！新しい設定に切り替わりました');
      console.log(`📊 浸透時間: ${elapsed}分`);
      console.log('');
      console.log('次のステップ: https://atsusa.jp にアクセスして動作確認を行ってください');
      break;
    }
    
    if (results.nsChanged || results.aChanged) {
      console.log('⚡ 部分的に浸透中...');
    }
    
    console.log('---');
    attempt++;
    
    // 2分間隔でチェック
    await new Promise(resolve => setTimeout(resolve, 120000));
  }
}

monitorDNS().catch(console.error);