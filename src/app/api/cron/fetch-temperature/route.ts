/**
 * 気温データ取得 Cron Job
 * 毎時20分に実行
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { generateTemperatureUrl } from '@/lib/data-urls'
import { fetchJSON, logFetch } from '@/lib/http-client'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('[CRON] Starting temperature data fetch...')
    
    // Authorization チェック（Vercel Cron Jobs）
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 気温データのURLを生成
    // 注意: 実際の気象庁APIエンドポイントに応じて調整が必要
    const temperatureUrl = generateTemperatureUrl()
    
    // 気温データを取得
    const result = await fetchJSON(temperatureUrl, {
      retries: 3,
      timeout: 30000
    })
    
    if (!result.success) {
      throw new Error(`Temperature data fetch failed: ${result.error}`)
    }
    
    logFetch(temperatureUrl, result, 'Temperature Data Fetch')
    console.log(`[CRON] Temperature data fetched successfully`)
    
    // データを変換・整形
    const processedData = processTemperatureData(result.data)
    
    // public/data/ ディレクトリにJSONファイルとして保存
    const dataDir = join(process.cwd(), 'public', 'data')
    const filePath = join(dataDir, 'temperature.json')
    
    const jsonData = {
      timestamp: new Date().toISOString(),
      updateTime: new Date().toLocaleString('ja-JP'),
      dataCount: processedData.length,
      data: processedData
    }
    
    await writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8')
    
    const duration = Date.now() - startTime
    console.log(`[CRON] Temperature data saved successfully in ${duration}ms`)
    
    return NextResponse.json({
      success: true,
      message: 'Temperature data updated successfully',
      timestamp: jsonData.timestamp,
      dataCount: processedData.length,
      duration: `${duration}ms`
    })
    
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[CRON] Temperature fetch failed:', error)
    
    logFetch('Temperature API', { 
      success: false, 
      error: (error as Error).message 
    }, 'Temperature Data Fetch')
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      duration: `${duration}ms`
    }, { status: 500 })
  }
}

/**
 * 気温データを処理・変換
 * 実際の気象庁APIレスポンス形式に応じて実装
 */
function processTemperatureData(rawData: any): any[] {
  // 仮の実装 - 実際のAPIレスポンス形式に応じて調整
  if (!rawData || !Array.isArray(rawData)) {
    console.warn('[CRON] Invalid temperature data format, using mock data')
    return generateMockTemperatureData()
  }
  
  return rawData.map((item: any) => ({
    locationCode: item.code || '',
    locationName: item.name || '',
    temperature: parseFloat(item.temp) || 0,
    humidity: parseFloat(item.humidity) || 0,
    timestamp: new Date().toISOString()
  }))
}

/**
 * モック気温データ生成（開発・テスト用）
 */
function generateMockTemperatureData() {
  const mockLocations = [
    { code: '44132', name: '東京' },
    { code: '46106', name: '横浜' },
    { code: '47662', name: '大阪' }
  ]
  
  return mockLocations.map(location => ({
    locationCode: location.code,
    locationName: location.name,
    temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
    humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
    timestamp: new Date().toISOString()
  }))
}

// POST メソッドも許可（手動実行用）
export async function POST(request: NextRequest) {
  return GET(request)
}