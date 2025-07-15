"use client"

import { useState } from 'react'
import { Menu, X, Search, MapPin, Heart, Info, ArrowUp, MessageSquare, Bell } from 'lucide-react'
import Link from 'next/link'

interface HeaderMenuProps {
  onSearchClick?: () => void
  onRegionClick?: () => void
  onFavoritesClick?: () => void
  onMenuStateChange?: (isOpen: boolean) => void
}

export function HeaderMenu({ onSearchClick, onRegionClick, onFavoritesClick, onMenuStateChange }: HeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onMenuStateChange?.(newState)
  }
  const closeMenu = () => {
    setIsOpen(false)
    onMenuStateChange?.(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    closeMenu()
  }

  const handleMenuItemClick = (callback?: () => void) => {
    if (callback) callback()
    closeMenu()
  }

  return (
    <>
      {/* ハンバーガーメニューボタン */}
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="メニューを開く"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* オーバーレイ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* メニューパネル */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">メニュー</h2>
            <button
              onClick={closeMenu}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              aria-label="メニューを閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* メニュー項目 */}
          <nav className="space-y-2">
            {/* 地点を検索 */}
            <button
              onClick={() => handleMenuItemClick(onSearchClick)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">地点を検索</span>
            </button>

            {/* 地方別で選択 */}
            <button
              onClick={() => handleMenuItemClick(onRegionClick)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors"
            >
              <MapPin className="w-5 h-5" />
              <span className="font-medium">地方別で選択</span>
            </button>

            {/* お気に入り一覧 */}
            <button
              onClick={() => handleMenuItemClick(onFavoritesClick)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">お気に入り一覧</span>
            </button>

            {/* このサイトについて */}
            <Link
              href="/about"
              onClick={closeMenu}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
            >
              <Info className="w-5 h-5" />
              <span className="font-medium">このサイトについて</span>
            </Link>

            {/* 運営からのお知らせ */}
            <Link
              href="/news"
              onClick={closeMenu}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="font-medium">運営からのお知らせ</span>
            </Link>

            {/* お問い合わせ */}
            <a
              href="https://forms.gle/YY5RfLTFermQdk7VA"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">お問い合わせ</span>
            </a>

            {/* トップへ戻る */}
            <button
              onClick={scrollToTop}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <ArrowUp className="w-5 h-5" />
              <span className="font-medium">トップへ戻る</span>
            </button>
          </nav>

          {/* フッター */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              暑さ指数チェッカー
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              環境省の暑さ指数データを使用
            </p>
          </div>
        </div>
      </div>
    </>
  )
}