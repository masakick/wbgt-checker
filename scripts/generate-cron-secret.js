/**
 * 本番環境用の安全なCRON_SECRETを生成するスクリプト
 */

const crypto = require('crypto')

function generateSecureSecret() {
  // 64文字のランダムな16進数文字列を生成
  return crypto.randomBytes(32).toString('hex')
}

console.log('=== 本番環境用CRON_SECRET ===')
console.log('')
console.log('以下の値をVercelの環境変数に設定してください：')
console.log('')
console.log(`CRON_SECRET=${generateSecureSecret()}`)
console.log('')
console.log('注意：')
console.log('- この値は秘密にし、外部に漏らさないでください')
console.log('- コミットやログに含めないでください')
console.log('- Vercel管理画面でのみ設定してください')