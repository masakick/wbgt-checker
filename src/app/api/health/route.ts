/**
 * ヘルスチェックAPI - 監視・稼働確認用エンドポイント
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// キャッシュ設定（1分間）
export const revalidate = 60

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  services: {
    database: 'up' | 'down'
    dataFetcher: 'up' | 'down'
    externalAPIs: 'up' | 'down'
  }
  performance: {
    responseTime: number
    dataFetchTime?: number
  }
  data: {
    lastUpdate: string
    locationsAvailable: number
  }
  errors?: string[]
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const errors: string[] = []
  
  try {
    // サービス状況チェック
    const services = {
      database: 'up' as 'up' | 'down', // ファイルベースのため常にup
      dataFetcher: 'up' as 'up' | 'down',
      externalAPIs: 'up' as 'up' | 'down'
    }
    
    let dataFetchTime: number | undefined
    let lastUpdate = 'unknown'
    let locationsAvailable = 0
    
    // データ取得テスト（Edge Runtimeでは簡略化）
    try {
      const dataFetchStart = Date.now()
      // 外部データソースの簡単な接続テスト
      const response = await fetch('https://masaki-yamabe.sakura.ne.jp/atsusa/data/wbgt.csv', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      
      dataFetchTime = Date.now() - dataFetchStart
      
      if (response.ok) {
        lastUpdate = new Date().toISOString()
        locationsAvailable = 840 // 概算値
      } else {
        services.dataFetcher = 'down'
        errors.push('Failed to connect to WBGT data source')
      }
    } catch (error) {
      services.dataFetcher = 'down'
      errors.push(`Data fetcher error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    // 外部API確認（データソース）
    try {
      const response = await fetch('https://masaki-yamabe.sakura.ne.jp/atsusa/data/wbgt.csv', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5秒タイムアウト
      })
      
      if (!response.ok) {
        services.externalAPIs = 'down'
        errors.push(`External API returned ${response.status}`)
      }
    } catch (error) {
      services.externalAPIs = 'down'
      errors.push(`External API unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    const responseTime = Date.now() - startTime
    
    // 総合ステータス判定
    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (services.dataFetcher === 'down') {
      status = 'unhealthy'
    } else if (services.externalAPIs === 'down' || errors.length > 0) {
      status = 'degraded'
    } else {
      status = 'healthy'
    }
    
    const healthCheck: HealthCheckResult = {
      status,
      timestamp: new Date().toISOString(),
      uptime: 0, // Edge Runtime doesn't support process.uptime
      version: '1.0.0',
      services,
      performance: {
        responseTime,
        dataFetchTime
      },
      data: {
        lastUpdate,
        locationsAvailable
      }
    }
    
    if (errors.length > 0) {
      healthCheck.errors = errors
    }
    
    // HTTPステータスコード決定
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 207 : 503
    
    return NextResponse.json(healthCheck, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': status
      }
    })
    
  } catch (error) {
    // 致命的エラー
    const healthCheck: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: 0,
      version: 'unknown',
      services: {
        database: 'down',
        dataFetcher: 'down',
        externalAPIs: 'down'
      },
      performance: {
        responseTime: Date.now() - startTime
      },
      data: {
        lastUpdate: 'unknown',
        locationsAvailable: 0
      },
      errors: [error instanceof Error ? error.message : 'Critical system error']
    }
    
    return NextResponse.json(healthCheck, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': 'unhealthy'
      }
    })
  }
}