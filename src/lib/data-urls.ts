/**
 * 現行サイトのCronで取得済みデータのURL
 */

/**
 * 現行サイトのWBGT CSVデータURL
 */
export function getCurrentSiteWBGTUrl(): string {
  return 'https://masaki-yamabe.sakura.ne.jp/atsusa/data/wbgt.csv'
}

/**
 * 現行サイトの予報CSVデータURL
 */
export function getCurrentSiteForecastUrl(): string {
  return 'https://masaki-yamabe.sakura.ne.jp/atsusa/data/forecast.csv'
}

/**
 * 現行サイトの気温JSONデータURL
 */
export function getCurrentSiteTemperatureUrl(): string {
  return 'https://masaki-yamabe.sakura.ne.jp/atsusa/data/temp.json'
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
 * 現行サイトからWBGTデータを取得
 */
export async function fetchWBGTData(): Promise<string> {
  const { fetchCSV } = await import('./http-client')
  
  const url = getCurrentSiteWBGTUrl()
  
  try {
    const result = await fetchCSV(url, { retries: 3, timeout: 30000 })
    
    if (result.success && result.data) {
      return result.data
    }
    
    throw new Error(`Current site WBGT fetch failed: ${result.error}`)
  } catch (error) {
    console.error('WBGT data fetch from current site failed:', error)
    throw error
  }
}

/**
 * 現行サイトから予報データを取得
 */
export async function fetchForecastData(): Promise<string> {
  const { fetchCSV } = await import('./http-client')
  
  const url = getCurrentSiteForecastUrl()
  
  try {
    const result = await fetchCSV(url, { retries: 3, timeout: 30000 })
    
    if (result.success && result.data) {
      return result.data
    }
    
    throw new Error(`Current site forecast fetch failed: ${result.error}`)
  } catch (error) {
    console.error('Forecast data fetch from current site failed:', error)
    throw error
  }
}

/**
 * 現行サイトから気温データを取得
 */
export async function fetchTemperatureData(): Promise<any> {
  const { fetchJSON } = await import('./http-client')
  
  const url = getCurrentSiteTemperatureUrl()
  
  try {
    const result = await fetchJSON(url, { retries: 3, timeout: 30000 })
    
    if (result.success && result.data) {
      return result.data
    }
    
    throw new Error(`Current site temperature fetch failed: ${result.error}`)
  } catch (error) {
    console.error('Temperature data fetch from current site failed:', error)
    throw error
  }
}