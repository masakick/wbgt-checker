"use client"

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { SiteLogo } from './SiteLogo'
import { HeaderMenu } from './HeaderMenu'
import { SearchBar } from './SearchBar'
import { RegionSelector } from './RegionSelector'
import { FavoritesList } from './FavoritesList'

interface NavigationHeaderProps {
  showBackButton?: boolean
  onDataReload?: () => void
}

export function NavigationHeader({ showBackButton = false, onDataReload }: NavigationHeaderProps) {
  const [activeModal, setActiveModal] = useState<'search' | 'region' | 'favorites' | null>(null)
  const regionModalRef = useRef<HTMLDivElement>(null)

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  const handleDataReload = () => {
    if (onDataReload) {
      onDataReload()
    } else if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const openModal = (type: 'search' | 'region' | 'favorites') => {
    setActiveModal(type)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  // 地方別選択モーダルが開いた時、地方選択部分にスクロール
  useEffect(() => {
    if (activeModal === 'region' && regionModalRef.current) {
      setTimeout(() => {
        const regionSection = regionModalRef.current?.querySelector('[data-section="region"]')
        if (regionSection) {
          regionSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }, 200)
    }
  }, [activeModal])

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* 左側: ロゴ */}
          <div className="flex items-center">
            <SiteLogo />
          </div>

          {/* 右側: メニューとリロードボタン */}
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button 
                onClick={handleDataReload}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="データを再読込み"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
            <HeaderMenu 
              onSearchClick={() => openModal('search')}
              onRegionClick={() => openModal('region')}
              onFavoritesClick={() => openModal('favorites')}
            />
          </div>
        </div>
      </header>

      {/* モーダル */}
      {activeModal && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeModal}
          />
          
          {/* モーダルコンテンツ */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
            <div 
              ref={activeModal === 'region' ? regionModalRef : undefined}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 relative">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeModal === 'search' && '地点を検索'}
                    {activeModal === 'region' && '地方別で選択'}
                    {activeModal === 'favorites' && 'お気に入り一覧'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* コンテンツ */}
                {activeModal === 'search' && (
                  <div className="relative z-[60] overflow-visible">
                    <SearchBar isInModal={true} />
                  </div>
                )}
                {activeModal === 'region' && (
                  <div data-section="region" className="overflow-visible">
                    <RegionSelector />
                  </div>
                )}
                {activeModal === 'favorites' && <FavoritesList />}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}