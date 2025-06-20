/**
 * HTTP クライアントとリトライロジック
 */

export interface FetchOptions {
  retries?: number
  retryDelay?: number
  timeout?: number
}

export interface FetchResult<T = any> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

/**
 * リトライ機能付きHTTPクライアント
 */
export async function fetchWithRetry<T = string>(
  url: string, 
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  let {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching ${url} (attempt ${attempt + 1}/${retries + 1})`)
      
      // タイムアウト設定
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'WBGT-App/1.0',
          'Accept': 'text/csv,text/plain,*/*'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.text() as T
      
      return {
        success: true,
        data,
        statusCode: response.status
      }
    } catch (error) {
      lastError = error as Error
      console.warn(`Attempt ${attempt + 1} failed:`, error)
      
      // 最後の試行でなければ待機
      if (attempt < retries) {
        console.log(`Retrying in ${retryDelay}ms...`)
        await sleep(retryDelay)
        // 指数バックオフ
        retryDelay *= 2
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    statusCode: 0
  }
}

/**
 * JSONデータを取得
 */
export async function fetchJSON<T>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const result = await fetchWithRetry(url, options)
  
  if (!result.success || !result.data) {
    return result as FetchResult<T>
  }
  
  try {
    const jsonData = JSON.parse(result.data as string)
    return {
      ...result,
      data: jsonData
    }
  } catch (error) {
    return {
      success: false,
      error: `JSON parse error: ${(error as Error).message}`
    }
  }
}

/**
 * CSVデータを取得
 */
export async function fetchCSV(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<string>> {
  return fetchWithRetry<string>(url, options)
}

/**
 * URLの生存確認（HEAD リクエスト）
 */
export async function checkUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'WBGT-App/1.0'
      }
    })
    return response.ok
  } catch (error) {
    console.error(`URL check failed for ${url}:`, error)
    return false
  }
}

/**
 * sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * ログ記録用のラッパー
 */
export function logFetch(url: string, result: FetchResult, operation: string): void {
  const timestamp = new Date().toISOString()
  
  if (result.success) {
    console.log(`[${timestamp}] ${operation} SUCCESS: ${url}`)
  } else {
    console.error(`[${timestamp}] ${operation} FAILED: ${url} - ${result.error}`)
  }
}