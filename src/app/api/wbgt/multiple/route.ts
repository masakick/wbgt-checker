/**
 * 複数地点のWBGTデータを一括取得するAPI
 */

import { NextRequest, NextResponse } from 'next/server'
import { getWBGTLevel } from '@/lib/data-processor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface WBGTSimpleData {
  code: string
  wbgt: number | null
  level: number
  label: string
  updateTime: string | null
}

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの存在チェック
    const body = await request.text()
    
    if (!body) {
      return NextResponse.json(
        { error: 'Request body is empty' },
        { status: 400 }
      )
    }

    const parsedBody = JSON.parse(body)
    const { locationCodes } = parsedBody
    
    if (!Array.isArray(locationCodes) || locationCodes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid location codes' },
        { status: 400 }
      )
    }

    // 最大10地点まで
    const codes = locationCodes.slice(0, 10)
    
    // 現行サイトからWBGTデータを取得
    let wbgtFileData: any = null
    
    try {
      const { fetchWBGTData } = await import('@/lib/data-urls')
      const { parseWBGTCSV } = await import('@/lib/data-processor')
      
      // 現行サイトからCSVデータを取得してパース
      const csvData = await fetchWBGTData()
      const parsedData = parseWBGTCSV(csvData)
      
      wbgtFileData = {
        timestamp: new Date().toISOString(),
        updateTime: new Date().toLocaleString('ja-JP'),
        dataCount: parsedData.length,
        data: parsedData
      }
    } catch (error) {
      console.error('Failed to fetch WBGT data from current site:', error)
    }

    // 各地点のデータを取得
    const results: WBGTSimpleData[] = codes.map(code => {
      if (!wbgtFileData || !wbgtFileData.data || !Array.isArray(wbgtFileData.data)) {
        return {
          code,
          wbgt: null,
          level: 0,
          label: 'データなし',
          updateTime: null
        }
      }
      
      // データ配列から該当する地点を検索
      const locationData = wbgtFileData.data.find((item: any) => item.locationCode === code)
      
      if (locationData && typeof locationData.wbgt === 'number') {
        const level = getWBGTLevel(locationData.wbgt)
        return {
          code,
          wbgt: locationData.wbgt,
          level: level.level,
          label: level.label,
          updateTime: wbgtFileData.updateTime || null
        }
      }
      
      // データがない場合
      return {
        code,
        wbgt: null,
        level: 0,
        label: 'データなし',
        updateTime: null
      }
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}