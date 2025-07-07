/**
 * 地点検索API
 * サーバーサイドで検索処理を行い、パフォーマンスを改善
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllCompleteLocations } from '@/lib/complete-locations'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  
  if (!query || query.length < 1) {
    return NextResponse.json([])
  }
  
  try {
    const allLocations = getAllCompleteLocations()
    const filtered = allLocations
      .filter(location => 
        location.name.includes(query) || 
        location.prefecture.includes(query)
      )
      .slice(0, 50) // 最大50件
      .map(location => ({
        code: location.code,
        name: location.name,
        prefecture: location.prefecture
      }))
    
    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json([], { status: 500 })
  }
}