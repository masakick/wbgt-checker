/**
 * ナビゲーションヘッダー - クライアントコンポーネント
 */

"use client"

import { ArrowLeft, RefreshCw } from 'lucide-react'

export function NavigationHeader() {
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  const handleDataReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600">このサイトについて</a>
            <span className="mx-2">｜</span>
            <a href="/" className="hover:text-blue-600">地点を選択</a>
            <span className="mx-2">｜</span>
            <button 
              onClick={handleDataReload} 
              className="hover:text-blue-600 flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              データ再読込み
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}