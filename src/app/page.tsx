/**
 * トップページ - 地点選択画面
 */

import { MapPin } from 'lucide-react'
import { FavoritesList } from '@/components/FavoritesList'
import { MainLocations } from '@/components/MainLocations'
import { WebSiteStructuredData } from '@/components/StructuredData'
import { NavigationHeader } from '@/components/NavigationHeader'
import { SearchBar } from '@/components/SearchBar'
import { RegionSelector } from '@/components/RegionSelector'

export default function HomePage() {
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
        <MainLocations />

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
            開発：一橋大学大学院ソーシャル・データサイエンス研究科　山辺真幸
          </p>
        </div>
      </footer>
    </div>
  )
}
