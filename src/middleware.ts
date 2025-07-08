import { NextRequest, NextResponse } from 'next/server'
import { LOCATION_REDIRECTS } from '@/lib/location-redirects'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // WBGT地点ページのパスパターンをチェック
  const wbgtMatch = pathname.match(/^\/wbgt\/([^\/]+)$/)
  
  if (wbgtMatch) {
    const locationCode = wbgtMatch[1]
    
    // 廃止地点の場合はトップページへリダイレクト
    if (LOCATION_REDIRECTS.deprecated.includes(locationCode)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // 変更地点の場合は新コードへリダイレクト
    const newCode = LOCATION_REDIRECTS.changed[locationCode as keyof typeof LOCATION_REDIRECTS.changed]
    if (newCode) {
      return NextResponse.redirect(new URL(`/wbgt/${newCode}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest.json, sw.js, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|screenshots).*)',
  ],
}