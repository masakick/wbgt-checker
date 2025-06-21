/**
 * トップページ - 地点選択画面
 */

import Link from 'next/link'
import { MapPin, Thermometer } from 'lucide-react'
import { getLocationInfoSync } from '@/lib/data-fetcher'
import { FavoritesList } from '@/components/FavoritesList'
import { WebSiteStructuredData } from '@/components/StructuredData'
import { NavigationHeader } from '@/components/NavigationHeader'
import { SearchBar } from '@/components/SearchBar'
import { RegionSelector } from '@/components/RegionSelector'

export default function HomePage() {
  // 主要地点のリスト
  const majorLocations = [
    { code: '44132', region: '関東' },
    { code: '46106', region: '関東' },
    { code: '47662', region: '関西' },
    { code: '27412', region: '中部' },
    { code: '40201', region: '九州' },
    { code: '48141', region: '北海道' },
    { code: '04101', region: '東北' },
    { code: '50301', region: '九州・沖縄' },
    { code: '21101', region: '中部' },
    { code: '15101', region: '中部' },
    { code: '17201', region: '中部' },
    { code: '39101', region: '四国' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <WebSiteStructuredData />
      
      {/* ナビゲーションヘッダー */}
      <NavigationHeader />

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* お気に入り地点（トップに配置） */}
        <FavoritesList />

        {/* 検索セクション */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            地点を検索
          </h2>
          <SearchBar />
        </div>

        {/* 主要地点 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            主要地点
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {majorLocations.map((location) => {
              const info = getLocationInfoSync(location.code)
              if (!info) return null
              
              return (
                <Link
                  key={location.code}
                  href={`/wbgt/${location.code}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{info.name}</h3>
                      <p className="text-sm text-gray-600">{info.prefecture}</p>
                      <p className="text-xs text-blue-600 mt-1">{location.region}地方</p>
                    </div>
                    <Thermometer className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* 地方別セクション */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            地方別で選択
          </h2>
          <RegionSelector />
        </div>

        {/* 使い方 */}
        <div className="bg-blue-50 rounded-2xl p-6 mt-8">
          <h2 className="text-xl font-bold mb-4 text-blue-900">
            暑さ指数について
          </h2>
          <div>
            <h3 className="font-semibold mb-2 text-blue-800">警戒レベル</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>危険（31°C以上）: 運動は原則中止</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span>厳重警戒（28-31°C）: 激しい運動は中止</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>警戒（25-28°C）: 積極的に休息</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>注意（21-25°C）: 積極的に水分補給</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>安全（21°C未満）: 適宜水分補給</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">
            データ提供：
            <a href="https://www.wbgt.env.go.jp/sp/" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">
              環境省
            </a>
            ,
            <a href="https://www.jma.go.jp/jma/index.html" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">
              気象庁
            </a>
            <br />
            開発：慶應義塾大学大学院 政策・メディア研究科 
            <a href="https://twitter.com/masakick" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">
              山辺真幸
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
