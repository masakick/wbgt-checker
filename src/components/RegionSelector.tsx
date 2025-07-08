"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, ChevronRight } from 'lucide-react'
import { regions, getPrefecturesByRegion } from '@/lib/region-data'
import { getAllCompleteLocations } from '@/lib/complete-locations'
import { useLoading } from '@/contexts/LoadingContext'

export function RegionSelector() {
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('')
  const { setIsLoading } = useLoading()
  
  // スクロール用のref
  const prefectureRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)

  // 選択された地方の都道府県を取得
  const prefectures = selectedRegion ? getPrefecturesByRegion(selectedRegion) : []
  
  // 選択された都道府県の地点を取得
  const getLocationsByPrefecture = (prefectureId: string) => {
    const allLocations = getAllCompleteLocations()
    return allLocations.filter(location => {
      // 沖縄県の特殊処理
      if (prefectureId === "9194") {
        // 沖縄県の地点コードは91, 92, 93, 94で始まる
        const locationPrefix = location.code.slice(0, 2)
        return locationPrefix === "91" || locationPrefix === "92" || 
               locationPrefix === "93" || locationPrefix === "94"
      }
      // 通常の都道府県: 地点コードの最初の2桁が都道府県IDと一致するものを探す
      const locationPrefectureId = location.code.slice(0, 2)
      return locationPrefectureId === prefectureId
    })
  }

  const locations = selectedPrefecture ? getLocationsByPrefecture(selectedPrefecture) : []

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId)
    setSelectedPrefecture('') // 都道府県選択をリセット
  }

  const handlePrefectureSelect = (prefectureId: string) => {
    setSelectedPrefecture(prefectureId)
  }
  
  // 地方選択時に都道府県セクションへスクロール
  useEffect(() => {
    if (selectedRegion && prefectureRef.current) {
      setTimeout(() => {
        const element = prefectureRef.current
        if (element) {
          // モーダル内かどうかを確認
          const modalContainer = element.closest('[class*="overflow-y-auto"]')
          
          if (modalContainer) {
            // モーダル内の場合：モーダル内でスクロール
            const modalTop = modalContainer.scrollTop
            const elementTop = element.offsetTop
            const targetScrollTop = elementTop - 20 // 少し余白を追加
            
            modalContainer.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            })
          } else {
            // 通常ページの場合：ページ全体でスクロール
            const headerHeight = 80
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - headerHeight
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            })
          }
        }
      }, 100)
    }
  }, [selectedRegion])
  
  // 都道府県選択時に地点セクションへスクロール
  useEffect(() => {
    if (selectedPrefecture && locationRef.current) {
      setTimeout(() => {
        const element = locationRef.current
        if (element) {
          // モーダル内かどうかを確認
          const modalContainer = element.closest('[class*="overflow-y-auto"]')
          
          if (modalContainer) {
            // モーダル内の場合：モーダル内でスクロール
            const modalTop = modalContainer.scrollTop
            const elementTop = element.offsetTop
            const targetScrollTop = elementTop - 20 // 少し余白を追加
            
            modalContainer.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            })
          } else {
            // 通常ページの場合：ページ全体でスクロール
            const headerHeight = 80
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - headerHeight
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            })
          }
        }
      }, 100)
    }
  }, [selectedPrefecture])

  return (
    <div className="space-y-6">
      {/* 地方選択 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          地方を選択
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => handleRegionSelect(region.id)}
              className={`
                p-4 text-left border rounded-lg transition-all hover:shadow-md
                ${selectedRegion === region.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{region.name}</span>
                {selectedRegion === region.id && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 都道府県選択 */}
      {selectedRegion && prefectures.length > 0 && (
        <div ref={prefectureRef}>
          <h3 className="text-lg font-semibold mb-4">
            都道府県を選択
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {prefectures.map((prefecture) => (
              <button
                key={prefecture.id}
                onClick={() => handlePrefectureSelect(prefecture.id)}
                className={`
                  p-3 text-left border rounded-lg transition-all hover:shadow-md
                  ${selectedPrefecture === prefecture.id
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{prefecture.name}</span>
                  {selectedPrefecture === prefecture.id && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 地点選択 */}
      {selectedPrefecture && locations.length > 0 && (
        <div ref={locationRef}>
          <h3 className="text-lg font-semibold mb-4">
            地点を選択
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {locations.map((location) => (
              <Link
                key={location.code}
                href={`/wbgt/${location.code}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all"
                onClick={() => setIsLoading(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{location.name}</div>
                    <div className="text-sm text-gray-600">{location.prefecture}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 選択状況の表示 */}
      {selectedRegion && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          選択中: {regions.find(r => r.id === selectedRegion)?.name}
          {selectedPrefecture && (
            <> → {prefectures.find(p => p.id === selectedPrefecture)?.name}</>
          )}
        </div>
      )}
    </div>
  )
}