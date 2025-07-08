/**
 * Service Worker for WBGT Checker PWA
 * 基本的なキャッシング機能のみ実装
 */

const CACHE_NAME = 'wbgt-checker-v1'
const DATA_CACHE_NAME = 'wbgt-data-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// キャッシュの有効期限（分）
const CACHE_EXPIRY_MINUTES = 30

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
  
  // 即座に有効化
  self.skipWaiting()
})

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // すべてのクライアントを即座に制御
  self.clients.claim()
})

// キャッシュの有効期限をチェック
function isExpired(response) {
  const fetched = response.headers.get('sw-fetched-on')
  if (fetched) {
    const elapsed = Date.now() - new Date(fetched).getTime()
    return elapsed > (CACHE_EXPIRY_MINUTES * 60 * 1000)
  }
  return true
}

// フェッチ時の処理（ネットワーク優先戦略）
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // データAPIリクエストの特別処理
  if (request.url.includes('/api/') || request.url.includes('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // ネットワークから取得成功時はキャッシュを更新
            if (response.status === 200) {
              const headers = new Headers(response.headers)
              headers.append('sw-fetched-on', new Date().toISOString())
              
              const responseWithHeaders = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: headers
              })
              
              cache.put(request, responseWithHeaders.clone())
              return response
            }
            return response
          })
          .catch(() => {
            // ネットワークエラー時はキャッシュから返す（期限切れでも）
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW] Serving data from cache (offline):', request.url)
                return cachedResponse
              }
              return new Response('Network error', { status: 503 })
            })
          })
      })
    )
    return
  }
  
  // その他のリクエスト
  event.respondWith(
    fetch(request)
      .then((response) => {
        // レスポンスが正常な場合はキャッシュに保存
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone)
            })
        }
        return response
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから返す
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving from cache:', request.url)
              return cachedResponse
            }
            
            // キャッシュにもない場合はオフラインページを返す
            if (request.destination === 'document') {
              return caches.match('/')
            }
            
            return new Response('Offline', { status: 503 })
          })
      })
  )
})

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received')
  
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body || '暑さ指数が更新されました',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'wbgt-update',
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: '確認する',
          icon: '/icons/icon-72x72.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || '暑さ指数チェッカー',
        options
      )
    )
  }
})

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    )
  }
})

// メッセージ受信時の処理
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type === 'CLEAR_DATA_CACHE') {
    event.waitUntil(
      caches.delete(DATA_CACHE_NAME).then(() => {
        console.log('[SW] Data cache cleared')
        return caches.open(DATA_CACHE_NAME)
      })
    )
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})