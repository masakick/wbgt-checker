/**
 * PWA専用の更新フック
 * - セッションストレージを使用して重複更新を防止
 * - フォアグラウンド復帰時のみ更新
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'

interface PWARefreshOptions {
  locationCode: string
  lastUpdated?: string
  refreshThresholdMinutes?: number
}

export function usePWARefresh({
  locationCode,
  lastUpdated,
  refreshThresholdMinutes = 60
}: PWARefreshOptions) {
  const router = useRouter()
  const { setIsLoading } = useLoading()

  useEffect(() => {
    // PWAモードでない場合は何もしない
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // セッションストレージのキー
    const sessionKey = `pwa-refresh-${locationCode}`
    const lastRefreshTime = sessionStorage.getItem(sessionKey)

    // 最後の更新から十分時間が経過しているかチェック
    const shouldCheckForUpdate = () => {
      if (!lastRefreshTime) return true
      
      const elapsed = Date.now() - parseInt(lastRefreshTime)
      const elapsedMinutes = elapsed / (1000 * 60)
      
      // 最後の更新チェックから30分以上経過している場合のみチェック
      return elapsedMinutes > 30
    }

    // データが古いかチェック（サーバーのデータ更新時刻を基準に）
    const isDataStale = () => {
      if (!lastUpdated) return false // データがない場合は更新しない
      
      try {
        // "7月8日 15時30分" 形式をパース
        const match = lastUpdated.match(/(\d+)月(\d+)日\s*(\d+)時(\d+)分/)
        if (!match) return false
        
        const [, month, day, hour, minute] = match
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
        return diffMinutes > refreshThresholdMinutes
      } catch (error) {
        console.error('[PWARefresh] 日付パースエラー:', error)
        return false
      }
    }

    // ページを更新
    const refreshPage = () => {
      console.log('[PWARefresh] データを更新します')
      sessionStorage.setItem(sessionKey, Date.now().toString())
      setIsLoading(true)
      
      // Service Workerのデータキャッシュをクリア
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_DATA_CACHE'
          })
        } catch (error) {
          console.log('[PWARefresh] Service Worker メッセージ送信エラー:', error)
        }
      }
      
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }

    // フォーカス時のハンドラー
    const handleFocus = () => {
      if (shouldCheckForUpdate() && isDataStale()) {
        console.log('[PWARefresh] アプリがフォーカスされました - 古いデータを検出')
        refreshPage()
      }
    }

    // Page Visibility API のハンドラー
    const handleVisibilityChange = () => {
      if (!document.hidden && shouldCheckForUpdate() && isDataStale()) {
        console.log('[PWARefresh] アプリがフォアグラウンドに戻りました - 古いデータを検出')
        refreshPage()
      }
    }

    // 初回マウント時のチェック（アプリ起動時）
    if (shouldCheckForUpdate() && isDataStale()) {
      console.log('[PWARefresh] アプリ起動時 - 古いデータを検出')
      refreshPage()
      return // 更新を開始したらイベントリスナーは設定しない
    }

    // イベントリスナー登録
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // クリーンアップ
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [locationCode]) // locationCodeのみを依存配列に含める

  return null
}