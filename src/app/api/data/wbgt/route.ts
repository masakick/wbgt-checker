/**
 * WBGT データ提供 API
 * Cron Jobで保存されたデータをフロントエンドに提供
 */

import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    // まずグローバルキャッシュを確認
    if (global.wbgtDataCache) {
      return NextResponse.json({
        ...global.wbgtDataCache,
        source: 'global_cache'
      })
    }
    
    // グローバルキャッシュが無い場合、/tmp ディレクトリから読み込み
    const filePath = join('/tmp', 'wbgt.json')
    const fileContent = await readFile(filePath, 'utf-8')
    const jsonData = JSON.parse(fileContent)
    
    // グローバルキャッシュに保存
    global.wbgtDataCache = jsonData
    
    return NextResponse.json({
      ...jsonData,
      source: 'file_system'
    })
  } catch (error) {
    console.error('WBGT data API error:', error)
    
    // フォールバック: 静的ファイルが存在する場合はエラーを返す
    return NextResponse.json(
      { 
        error: 'WBGT data not available',
        message: 'Real-time data not found, using mock data',
        timestamp: new Date().toISOString()
      }, 
      { status: 404 }
    )
  }
}