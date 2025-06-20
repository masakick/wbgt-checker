/**
 * 環境省 暑さ指数データのURL自動生成
 */

/**
 * 現在の年月に基づいてWBGT CSVのURLを生成
 * 月末・月初の移行期間は前月・当月両方をトライしてフォールバック
 */
export function generateWBGTUrl(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  
  return `https://www.wbgt.env.go.jp/est15WG/dl/wbgt_all_${year}${month}.csv`
}

/**
 * フォールバック用に前月のWBGT URLを生成
 */
export function generatePreviousMonthWBGTUrl(date: Date = new Date()): string {
  const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)
  return generateWBGTUrl(prevMonth)
}

/**
 * 気象庁 気温データのURL
 * ※ 実際のAPIエンドポイントに応じて調整が必要
 */
export function generateTemperatureUrl(): string {
  // 既存のfetchTemp.phpが使用しているエンドポイントを調査して実装
  return 'https://www.jma.go.jp/bosai/forecast/data/forecast/'
}

/**
 * URLの有効性を確認（HEADリクエスト）
 */
export async function checkUrlAvailability(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.error(`URL check failed for ${url}:`, error)
    return false
  }
}

/**
 * WBGT データを取得（フォールバック機能付き）
 */
export async function fetchWBGTData(date: Date = new Date()): Promise<string> {
  const { fetchCSV } = await import('./http-client')
  
  const currentUrl = generateWBGTUrl(date)
  
  try {
    // 現在月のURLを試行
    const result = await fetchCSV(currentUrl, { retries: 2, timeout: 30000 })
    
    if (result.success && result.data) {
      return result.data
    }
    
    // 失敗した場合、前月のURLを試行
    console.warn(`Current month URL failed: ${currentUrl} - ${result.error}`)
    const previousUrl = generatePreviousMonthWBGTUrl(date)
    
    const fallbackResult = await fetchCSV(previousUrl, { retries: 1, timeout: 30000 })
    
    if (fallbackResult.success && fallbackResult.data) {
      console.info(`Using fallback URL: ${previousUrl}`)
      return fallbackResult.data
    }
    
    throw new Error(`Both URLs failed: ${currentUrl} (${result.error}), ${previousUrl} (${fallbackResult.error})`)
  } catch (error) {
    console.error('WBGT data fetch failed:', error)
    throw error
  }
}