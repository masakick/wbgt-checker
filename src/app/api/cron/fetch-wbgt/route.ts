/**
 * WBGT データ取得 Cron Job
 * 毎時40分に実行
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { fetchWBGTData } from '@/lib/data-urls'
import { parseWBGTCSV, validateWBGTData } from '@/lib/data-processor'
import { logFetch } from '@/lib/http-client'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('[CRON] Starting WBGT data fetch...')
    
    // Authorization チェック（Vercel Cron Jobs）
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // WBGT CSVデータを取得
    const csvData = await fetchWBGTData()
    logFetch('WBGT CSV', { success: true }, 'WBGT Data Fetch')
    
    // CSVをパース
    const parsedData = parseWBGTCSV(csvData)
    console.log(`[CRON] Parsed ${parsedData.length} WBGT records`)
    
    // データの整合性チェック
    const validation = validateWBGTData(parsedData)
    if (!validation.valid) {
      console.error('[CRON] Data validation failed:', validation.errors)
      return NextResponse.json({
        error: 'Data validation failed',
        details: validation.errors
      }, { status: 400 })
    }
    
    // Vercel環境では /tmp ディレクトリに保存
    const filePath = join('/tmp', 'wbgt.json')
    
    const jsonData = {
      timestamp: new Date().toISOString(),
      updateTime: new Date().toLocaleString('ja-JP'),
      dataCount: parsedData.length,
      data: parsedData
    }
    
    await writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8')
    
    const duration = Date.now() - startTime
    console.log(`[CRON] WBGT data saved successfully in ${duration}ms`)
    
    return NextResponse.json({
      success: true,
      message: 'WBGT data updated successfully',
      timestamp: jsonData.timestamp,
      dataCount: parsedData.length,
      duration: `${duration}ms`
    })
    
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[CRON] WBGT fetch failed:', error)
    console.error('[CRON] Error stack:', (error as Error).stack)
    
    logFetch('WBGT CSV', { 
      success: false, 
      error: (error as Error).message 
    }, 'WBGT Data Fetch')
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      duration: `${duration}ms`
    }, { status: 500 })
  }
}

// POST メソッドも許可（手動実行用）
export async function POST(request: NextRequest) {
  return GET(request)
}