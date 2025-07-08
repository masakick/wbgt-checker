import { NextRequest } from 'next/server'
import { getLocationInfoSync } from '@/lib/data-fetcher'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationCode: string }> }
) {
  const { locationCode } = await params
  
  try {
    // 地点情報を取得
    const locationInfo = getLocationInfoSync(locationCode)
    
    if (!locationInfo) {
      return new Response('Location not found', { status: 404 })
    }

    // 地点専用のmanifest.json
    const manifest = {
      "name": `${locationInfo.name}（${locationInfo.prefecture}）の暑さ指数`,
      "short_name": `${locationInfo.name}WBGT`,
      "description": `${locationInfo.name}（${locationInfo.prefecture}）の暑さ指数（WBGT）をリアルタイムで確認`,
      "start_url": `/wbgt/${locationCode}`,
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#3b82f6",
      "orientation": "portrait-primary",
      "scope": "/",
      "lang": "ja",
      "categories": ["health", "weather", "utilities"],
      "icons": [
        {
          "src": "/icons/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "/icons/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "maskable"
        },
        {
          "src": "/icons/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "/icons/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "maskable"
        }
      ],
      "shortcuts": [
        {
          "name": `${locationInfo.name}の暑さ指数`,
          "short_name": locationInfo.name,
          "description": `${locationInfo.name}の暑さ指数を確認`,
          "url": `/wbgt/${locationCode}`,
          "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "96x96" }]
        },
        {
          "name": "他の地点を検索",
          "short_name": "検索",
          "description": "他の地点の暑さ指数を検索",
          "url": "/",
          "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "96x96" }]
        }
      ],
      "screenshots": [
        {
          "src": "/screenshots/desktop.png",
          "sizes": "1280x720",
          "type": "image/png",
          "form_factor": "wide",
          "label": "デスクトップ版画面"
        },
        {
          "src": "/screenshots/mobile.png", 
          "sizes": "360x640",
          "type": "image/png",
          "form_factor": "narrow",
          "label": "モバイル版画面"
        }
      ]
    }

    return new Response(JSON.stringify(manifest, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // 24時間キャッシュ
      },
    })
  } catch (error) {
    console.error('Dynamic manifest generation error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}