/**
 * PWA インストールプロンプトとサービスワーカー登録
 */

"use client"

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Navigator {
    standalone?: boolean
  }
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // PWAインストールプロンプトのリスナー
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallBanner(true)
      console.log('[PWA] beforeinstallprompt event captured')
    }

    // アプリがインストール済みかチェック
    const checkIfInstalled = () => {
      // スタンドアロンモードをチェック
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        console.log('[PWA] App is already installed (standalone mode)')
        return
      }
      
      // iOS Safari での PWA チェック
      if (navigator.standalone === true) {
        setIsInstalled(true)
        console.log('[PWA] App is already installed (iOS standalone)')
        return
      }
    }

    // アプリがインストールされた後のイベント
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed')
      setIsInstalled(true)
      setShowInstallBanner(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    checkIfInstalled()

    // PWA installability をチェック（デバッグ用）
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          console.log('[PWA] Service Worker is registered:', registration.scope)
        } else {
          console.log('[PWA] Service Worker is not registered yet')
        }
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt')
        setShowInstallBanner(false)
        setIsInstalled(true)
      } else {
        console.log('[PWA] User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    setDeferredPrompt(null)
  }

  // インストール済みの場合は表示しない
  if (isInstalled || !showInstallBanner || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            アプリをインストール
          </h3>
          <p className="text-xs text-blue-100 mb-3">
            ホーム画面に追加して、すばやく暑さ指数を確認できます。
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
            >
              <Download className="w-3 h-3" />
              インストール
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-100 hover:text-white text-xs px-2 py-1 transition-colors"
            >
              後で
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-100 hover:text-white p-1 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}