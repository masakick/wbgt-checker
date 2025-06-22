"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Heart, Trash2, Clock } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'
import { formatJapaneseTime } from '@/lib/format-time'

interface WBGTData {
  code: string
  wbgt: number | null
  level: number
  label: string
  guidance: string
  updateTime: string | null
}

export function FavoritesList() {
  const { favorites, removeFavorite, isLoading } = useFavorites()
  const [wbgtData, setWbgtData] = useState<Record<string, WBGTData>>({})
  const [dataLoading, setDataLoading] = useState(false)

  // 地点コードの配列をメモ化して依存配列を安定させる
  const locationCodes = useMemo(() => favorites.map(f => f.code), [favorites])
  
  // 地点コードの文字列化で安定した依存関係を作る
  const locationCodesKey = useMemo(() => locationCodes.join(','), [locationCodes])


  // 安定したモックデータを生成する関数
  const generateStableMockData = useMemo(() => {
    return (codes: string[]): Record<string, WBGTData> => {
      const dataMap: Record<string, WBGTData> = {}
      codes.forEach(code => {
        // 地点コードに基づいて安定した値を生成（ハッシュ的な方法）
        const seed = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const wbgt = (seed % 15) + 20 // 20-35の範囲で安定した値
        const level = seed % 5 // 0-4の警戒レベル
        const labels = ['安全', '注意', '警戒', '厳重警戒', '危険']
        const guidances = [
          '適宜水分補給',
          '積極的に水分補給',
          '積極的に休憩・水分補給',
          '激しい運動は中止',
          '運動は原則中止'
        ]
        
        dataMap[code] = {
          code,
          wbgt,
          level,
          label: labels[level],
          guidance: guidances[level],
          updateTime: formatJapaneseTime('2025-06-22T10:30:00')
        }
      })
      return dataMap
    }
  }, [])

  // お気に入り地点のWBGTデータを取得（一度のみ、自動更新なし）
  useEffect(() => {
    if (locationCodes.length === 0) {
      setWbgtData({})
      return
    }
    
    const fetchWBGTData = async () => {
      setDataLoading(true)
      
      try {
        // 開発環境では安定したモックデータを使用
        if (process.env.NODE_ENV === 'development') {
          const dataMap = generateStableMockData(locationCodes)
          setWbgtData(dataMap)
          setDataLoading(false)
          return
        }

        // 本番環境では実APIを使用（自動更新なし）
        const response = await fetch('/api/wbgt/multiple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locationCodes })
        })
        
        if (response.ok) {
          const data: WBGTData[] = await response.json()
          const dataMap = data.reduce((acc, item) => {
            // 時刻を日本語形式にフォーマット
            const formattedItem = {
              ...item,
              updateTime: item.updateTime ? formatJapaneseTime(item.updateTime) : null
            }
            acc[item.code] = formattedItem
            return acc
          }, {} as Record<string, WBGTData>)
          setWbgtData(dataMap)
        } else {
          console.warn('API returned error status:', response.status)
        }
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('Network error - WBGT data unavailable')
        } else {
          console.error('Failed to fetch WBGT data:', error)
        }
      } finally {
        setDataLoading(false)
      }
    }

    // 初回のみデータを取得し、自動更新は行わない
    fetchWBGTData()
  }, [locationCodesKey])

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          お気に入りがありません
        </h3>
        <p className="text-gray-500 text-sm">
          地点詳細ページでハートマークをタップして<br />
          お気に入りに追加しましょう
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-500 fill-current" />
        お気に入り地点
        <span className="text-sm font-normal text-gray-500">
          ({favorites.length}件)
        </span>
      </h2>
      
      <div className="space-y-3">
        {favorites.map((favorite) => {
          const data = wbgtData[favorite.code]
          const hasData = data && data.wbgt !== null
          
          // 警戒レベルに応じた色クラスを取得
          const getLevelColor = (level: number) => {
            switch(level) {
              case 0: return 'bg-blue-500'
              case 1: return 'bg-green-500'
              case 2: return 'bg-yellow-500'
              case 3: return 'bg-orange-500'
              case 4: return 'bg-red-500'
              default: return 'bg-gray-400'
            }
          }
          
          return (
            <div key={favorite.code} className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <Link
                  href={`/wbgt/${favorite.code}`}
                  className="flex-1 block"
                >
                  {/* 時刻を上部に表示 */}
                  {hasData && data.updateTime && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>{data.updateTime}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                        {favorite.name}
                      </h3>
                      <p className="text-sm text-gray-600">{favorite.prefecture}</p>
                    </div>
                    {hasData && (
                      <span
                        className={cn(
                          "inline-block px-3 py-1 rounded-full text-white font-bold text-sm",
                          getLevelColor(data.level)
                        )}
                      >
                        {data.wbgt}
                      </span>
                    )}
                  </div>
                  
                  {hasData && (
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-block px-2 py-1 rounded text-white text-xs font-medium",
                          getLevelColor(data.level)
                        )}
                      >
                        {data.label}
                      </span>
                      <span className="text-xs text-gray-600">
                        {data.guidance}
                      </span>
                    </div>
                  )}
                  
                  {!hasData && dataLoading && (
                    <div className="text-sm text-gray-500">読み込み中...</div>
                  )}
                  
                  {!hasData && !dataLoading && (
                    <div className="text-sm text-gray-500">データなし</div>
                  )}
                </Link>
                
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    removeFavorite(favorite.code)
                  }}
                  className="ml-3 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="お気に入りから削除"
                  aria-label="お気に入りから削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      {favorites.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 お気に入り地点はブラウザに保存されます。削除・リセット時にデータが失われる場合があります。
          </p>
        </div>
      )}
    </div>
  )
}