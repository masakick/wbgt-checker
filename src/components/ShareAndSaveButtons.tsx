"use client"

import { useState, useEffect, useRef } from "react"
import { Share2, Download, Twitter, MessageCircle, QrCode } from "lucide-react"
import QRCodeLib from "qrcode"

interface ShareAndSaveButtonsProps {
  location: string
  wbgt: number
  pageUrl: string
  qrCodeUrl: string
}

export function ShareAndSaveButtons({
  location,
  wbgt,
  pageUrl,
  qrCodeUrl
}: ShareAndSaveButtonsProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [canShare, setCanShare] = useState(false)

  // ブラウザの共有機能の可否をチェック
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])

  // QRコード生成
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrUrl = await QRCodeLib.toDataURL(pageUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrDataUrl(qrUrl)
      } catch (error) {
        console.error('QRコード生成エラー:', error)
      }
    }
    
    if (pageUrl) {
      generateQR()
    }
  }, [pageUrl])

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

  const handleSaveImage = async () => {
    try {
      // Canvas APIを使用して画像を生成・保存
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 800
      canvas.height = 600
      
      // 背景色を設定
      ctx.fillStyle = '#3B82F6'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // テキストを描画
      ctx.fillStyle = 'white'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${location}の暑さ指数`, canvas.width / 2, 200)
      
      ctx.font = 'bold 72px Arial'
      ctx.fillText(`${wbgt}°C`, canvas.width / 2, 300)
      
      ctx.font = '24px Arial'
      ctx.fillText('暑さ指数チェッカー', canvas.width / 2, 400)
      
      // 画像をダウンロード
      const link = document.createElement('a')
      link.download = `${location}_暑さ指数_${wbgt}度.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('画像保存エラー:', error)
    }
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
      {/* 共有・保存ボタン */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          共有・保存
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

          {/* 画像保存 */}
          <button
            onClick={handleSaveImage}
            className="flex items-center justify-center gap-2 bg-purple-500 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-purple-600 transition-colors text-sm md:text-base"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>
    </div>
  )
}