/**
 * PWAでの自動データ更新フック
 * - アプリ起動時・フォーカス時にデータを更新
 * - 古いデータの検出と自動更新
 */

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'

interface AutoRefreshOptions {
  lastUpdated?: string // 最終更新時刻
  refreshThresholdMinutes?: number // 更新閾値（分）
  onRefresh?: () => void // 更新時のコールバック
}

export function useAutoRefresh({
  lastUpdated,
  refreshThresholdMinutes = 30,
  onRefresh
}: AutoRefreshOptions = {}) {
  const router = useRouter()
  const { setIsLoading } = useLoading()
  
  // 更新が実行されたかを追跡（同じセッション内での重複更新を防ぐ）
  const [hasRefreshed, setHasRefreshed] = useState(false)

  // データが古いかチェック
  const isDataStale = useCallback(() => {
    if (!lastUpdated) {
      console.log('[AutoRefresh] lastUpdated is empty')
      return true
    }
    
    try {
      // 最終更新時刻をパース（"7月8日 15時30分" 形式）
      const dateMatch = lastUpdated.match(/(\d+)月(\d+)日\s*(\d+)時(\d+)分/)
      if (!dateMatch) {
        console.log('[AutoRefresh] 日付フォーマットが一致しません:', lastUpdated)
        return false // パースできない場合は更新しない
      }

      const [, month, day, hour, minute] = dateMatch
      const now = new Date()
      const updateDate = new Date(
        now.getFullYear(),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      )

      // 年を跨ぐ場合の調整
      if (updateDate > now) {
        updateDate.setFullYear(updateDate.getFullYear() - 1)
      }

      const diffMinutes = (now.getTime() - updateDate.getTime()) / (1000 * 60)
      console.log(`[AutoRefresh] 最終更新: ${lastUpdated}, 経過時間: ${diffMinutes.toFixed(1)}分, 閾値: ${refreshThresholdMinutes}分`)
      return diffMinutes > refreshThresholdMinutes
    } catch (error) {
      console.error('[AutoRefresh] 日付パースエラー:', error)
      return false // エラーの場合は更新しない
    }
  }, [lastUpdated, refreshThresholdMinutes])

  // ページをリフレッシュ
  const refreshPage = useCallback(() => {
    console.log('[AutoRefresh] データを更新します')
    
    // ローディング表示を開始
    setIsLoading(true)
    
    if (onRefresh) {
      onRefresh()
    } else {
      // onRefreshが指定されていない場合はページ全体をリロード
      // 強制的に再検証
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.open(name).then(cache => {
              cache.keys().then(requests => {
                requests.forEach(request => {
                  if (request.url.includes('/api/') || request.url.includes('/data/')) {
                    cache.delete(request)
                  }
                })
              })
            })
          })
        })
      }
      
      // 少し遅延を入れてからリフレッシュ（ローディング表示を見せるため）
      setTimeout(() => {
        // ページ全体をリロード（より確実な更新）
        window.location.reload()
      }, 100)
    }
  }, [router, onRefresh, setIsLoading])

  useEffect(() => {
    // 既に更新済みの場合は何もしない
    if (hasRefreshed) {
      return
    }
    
    // 初回マウント時にデータが古い場合は更新（一度だけ）
    const isStale = isDataStale()
    if (isStale) {
      console.log('[AutoRefresh] 古いデータを検出しました')
      setHasRefreshed(true) // 更新済みフラグを立てる
      refreshPage()
      return // 更新を開始したらイベントリスナーは設定しない
    }

    // Page Visibility API を使用してフォーカス時に更新
    const handleVisibilityChange = () => {
      if (!document.hidden && isDataStale()) {
        console.log('[AutoRefresh] アプリがフォアグラウンドに戻りました - データを更新します')
        refreshPage()
      }
    }

    // PWAの場合、アプリ起動時も検出
    const handleFocus = () => {
      if (isDataStale()) {
        console.log('[AutoRefresh] ウィンドウがフォーカスされました - データを更新します')
        refreshPage()
      }
    }

    // イベントリスナー登録
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    // PWA起動時の特別な処理
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[AutoRefresh] PWAモードで実行中')
      // Service Workerにメッセージを送信してキャッシュをクリア
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_DATA_CACHE'
        })
      }
    }

    // クリーンアップ
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, []) // 依存配列を空にして初回のみ実行

  return { isDataStale: isDataStale(), refreshPage }
}