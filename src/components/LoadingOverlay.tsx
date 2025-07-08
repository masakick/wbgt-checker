'use client'

import { useLoading } from '@/contexts/LoadingContext'

export function LoadingOverlay() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景のオーバーレイ */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      {/* ローディングコンテンツ */}
      <div className="relative bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
        {/* スピナー */}
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
        
        {/* テキスト */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">読み込み中...</p>
          <p className="text-sm text-gray-600 mt-1">しばらくお待ちください</p>
        </div>
      </div>
    </div>
  )
}