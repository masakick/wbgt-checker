"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Thermometer, Clock } from 'lucide-react'
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

// 主要6地点の定義
const MAJOR_LOCATIONS = [
  { code: '14163', name: '札幌', prefecture: '北海道', region: '北海道' },
  { code: '34392', name: '仙台', prefecture: '宮城県', region: '東北' },
  { code: '44132', name: '東京', prefecture: '東京都', region: '関東' },
  { code: '51106', name: '名古屋', prefecture: '愛知県', region: '中部' },
  { code: '62078', name: '大阪', prefecture: '大阪府', region: '関西' },
  { code: '82182', name: '福岡', prefecture: '福岡県', region: '九州' }
]

export function MainLocations() {
  const [wbgtData, setWbgtData] = useState<Record<string, WBGTData>>({})
  const [dataLoading, setDataLoading] = useState(false)

  // 地点コードの配列
  const locationCodes = MAJOR_LOCATIONS.map(loc => loc.code)
  const locationCodesKey = locationCodes.join(',')


  // 安定したモックデータを生成する関数
  const generateStableMockData = useMemo(() => {
    return (codes: string[]): Record<string, WBGTData> => {
      const dataMap: Record<string, WBGTData> = {}
      codes.forEach(code => {
        // 地点コードに基づいて安定した値を生成
        const seed = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const wbgt = (seed % 15) + 20 // 20-35の範囲で安定した値
        const level = seed % 5 // 0-4の警戒レベル
        const labels = ['ほぼ安全', '注意', '警戒', '厳重警戒', '危険']
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

  // WBGTデータを取得（一度のみ）
  useEffect(() => {
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

        // 本番環境では実APIを使用
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

    fetchWBGTData()
  }, [locationCodesKey])

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
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Thermometer className="w-5 h-5" />
        主要地点
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MAJOR_LOCATIONS.map((location) => {
          const data = wbgtData[location.code]
          const hasData = data && data.wbgt !== null
          
          return (
            <Link
              key={location.code}
              href={`/wbgt/${location.code}`}
              className="block bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-all hover:bg-gray-100"
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
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {location.prefecture}
                  </p>
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
                <div className="flex items-center gap-2 text-gray-400">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-sm">暑さ指数を確認</span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}