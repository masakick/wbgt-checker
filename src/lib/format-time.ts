/**
 * 日本語形式の時刻フォーマット関数
 */

export function formatJapaneseTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  // 無効な日付の場合はエラーハンドリング
  if (isNaN(date.getTime())) {
    return '不明'
  }
  
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  
  return `${month}月${day}日 ${hour}時${minute.toString().padStart(2, '0')}分`
}