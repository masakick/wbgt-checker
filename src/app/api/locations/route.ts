/**
 * 地点一覧API
 * 都道府県IDから地点リストを取得
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllCompleteLocations } from '@/lib/complete-locations'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const prefectureId = searchParams.get('prefecture')
  
  if (!prefectureId) {
    return NextResponse.json([])
  }
  
  try {
    const allLocations = getAllCompleteLocations()
    const filtered = allLocations.filter(location => {
      // 沖縄県の特殊処理
      if (prefectureId === "9194") {
        const locationPrefix = location.code.slice(0, 2)
        return locationPrefix === "91" || locationPrefix === "92" || 
               locationPrefix === "93" || locationPrefix === "94"
      }
      // 通常の都道府県
      const locationPrefectureId = location.code.slice(0, 2)
      return locationPrefectureId === prefectureId
    }).map(location => ({
      code: location.code,
      name: location.name
    }))
    
    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Locations API error:', error)
    return NextResponse.json([], { status: 500 })
  }
}