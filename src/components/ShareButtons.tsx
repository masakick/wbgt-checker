"use client"

import { useState, useEffect } from "react"
import { Share2, Twitter, MessageCircle } from "lucide-react"

interface ShareButtonsProps {
  location: string
  wbgt: number
  pageUrl: string
  qrCodeUrl: string
}

export function ShareButtons({
  location,
  wbgt,
  pageUrl,
  qrCodeUrl
}: ShareButtonsProps) {
  const [canShare, setCanShare] = useState(false)

  // ブラウザの共有機能の可否をチェック
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])

  const shareText = `${location}の暑さ指数は${wbgt}°Cです。`
  const hashtags = "暑さ指数チェッカー"

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&hashtags=${encodeURIComponent(hashtags)}&url=${encodeURIComponent(pageUrl)}`
    window.open(url, '_blank')
  }

  const handleLineShare = () => {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}`
    window.open(url, '_blank')
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: `${location}の暑さ指数`,
        text: shareText,
        url: pageUrl,
      })
    } catch (error) {
      console.error('共有エラー:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* 共有ボタン */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          共有
        </h3>
        
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3">
          {/* ネイティブ共有（モバイル対応） */}
          {canShare && (
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">共有</span>
            </button>
          )}

          {/* Twitter共有 */}
          <button
            onClick={handleTwitterShare}
            className="flex items-center justify-center gap-2 bg-black text-white px-3 py-2 md:px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm md:text-base"
          >
            <Twitter className="w-4 h-4" />
            <span className="hidden sm:inline">X</span>
          </button>

          {/* LINE共有 */}
          <button
            onClick={handleLineShare}
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-green-600 transition-colors text-sm md:text-base"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">LINE</span>
          </button>
        </div>
      </div>
    </div>
  )
}