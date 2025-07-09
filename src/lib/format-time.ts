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

/**
 * 予報更新時刻をフォーマット（"2025/07/09 15:25" → "7月9日 15時25分"）
 */
export function formatForecastUpdateTime(updateTimeString: string): string {
  try {
    // "2025/07/09 15:25" 形式をパース
    const match = updateTimeString.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s*(\d{1,2}):(\d{1,2})/)
    if (!match) {
      return updateTimeString // パースできない場合は元の文字列を返す
    }
    
    const [, year, month, day, hour, minute] = match
    
    return `${parseInt(month)}月${parseInt(day)}日 ${parseInt(hour)}時${parseInt(minute)}分`
  } catch (error) {
    console.warn('Failed to format forecast update time:', error)
    return updateTimeString // エラーの場合は元の文字列を返す
  }
}