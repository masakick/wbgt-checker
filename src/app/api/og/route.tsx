/**
 * Dynamic OGP image generation API
 */

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getWBGTLevel } from '@/lib/data-processor'

export const runtime = 'nodejs'

// Font loading
const notoSansJPBold = fetch(
  new URL('./NotoSansJP-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

export async function GET(request: NextRequest) {
  try {
    const fontData = await notoSansJPBold
    const { searchParams } = new URL(request.url)
    
    // Get parameters
    const location = searchParams.get('location') || '東京'
    const wbgt = parseFloat(searchParams.get('wbgt') || '25')
    const temp = searchParams.get('temp') || '30°C'
    const humidity = searchParams.get('humidity') || '65%'
    
    // Get WBGT level info
    const level = getWBGTLevel(wbgt)
    
    // Level colors
    const levelColors = {
      0: '#3B82F6', // blue-500
      1: '#10B981', // green-500
      2: '#F59E0B', // yellow-500
      3: '#F97316', // orange-500
      4: '#EF4444', // red-500
    } as const
    
    const bgColor = levelColors[level.level as keyof typeof levelColors] || '#3B82F6'
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#F9FAFB',
            fontFamily: 'Noto Sans JP',
          }}
        >
          {/* Header with gradient */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '40px 60px',
              background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}DD 100%)`,
              color: 'white',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: 48, fontWeight: 'bold', margin: 0 }}>
                {location}の暑さ指数
              </h1>
              <p style={{ fontSize: 24, margin: '10px 0 0 0', opacity: 0.9 }}>
                熱中症予防情報
              </p>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>
              🌡️ WBGT
            </div>
          </div>
          
          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              padding: '60px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* WBGT Value */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  fontSize: 120,
                  fontWeight: 'bold',
                  color: bgColor,
                  lineHeight: 1,
                }}
              >
                {wbgt}
              </div>
              <div style={{ fontSize: 32, color: '#6B7280', marginTop: 10 }}>
                °C
              </div>
            </div>
            
            {/* Level info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px 60px',
                backgroundColor: `${bgColor}15`,
                borderRadius: 20,
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: bgColor,
                  marginBottom: 20,
                }}
              >
                {level.label}
              </div>
              <div style={{ fontSize: 28, color: '#374151', textAlign: 'center' }}>
                {level.guidance}
              </div>
            </div>
            
            {/* Additional info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 24, color: '#6B7280' }}>🌡️ 気温:</div>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#374151' }}>
                  {temp}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 24, color: '#6B7280' }}>💧 湿度:</div>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#374151' }}>
                  {humidity}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '30px 60px',
              backgroundColor: '#F3F4F6',
              fontSize: 18,
              color: '#6B7280',
            }}
          >
            <div>暑さ指数チェッカー - 全国840地点対応</div>
            <div>データ提供：環境省・気象庁</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Noto Sans JP',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ],
      }
    )
  } catch (e) {
    console.error('OGP generation error:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}