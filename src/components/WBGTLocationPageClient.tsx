"use client"

import { useState } from 'react'
import { WBGTVisualization } from '@/components/WBGTVisualization'
import { DetailedForecastTable } from '@/components/DetailedForecastTable'
import { ActivityGuideSelector } from '@/components/ActivityGuideSelector'
import { ShareButtons } from '@/components/ShareButtons'
import { QRCodeSection } from '@/components/QRCodeSection'
import { NavigationHeader } from '@/components/NavigationHeader'
import { FavoriteButton } from '@/components/FavoriteButton'
import { ScrollGuide } from '@/components/ScrollGuide'
import { LoadingManager } from '@/components/LoadingManager'
import { AutoRefreshWrapper } from '@/components/AutoRefreshWrapper'
import { Info } from 'lucide-react'
import { formatJapaneseTime, formatForecastUpdateTime } from '@/lib/format-time'
import { getRegionByPrefectureCode } from '@/lib/region-data'
import type { WBGTData, WBGTLevel } from '@/types'

interface WBGTLocationPageClientProps {
  locationCode: string
  wbgtData: WBGTData
  levelInfo: WBGTLevel
  pageUrl: string
}

export function WBGTLocationPageClient({ 
  locationCode, 
  wbgtData, 
  levelInfo, 
  pageUrl 
}: WBGTLocationPageClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuStateChange = (isOpen: boolean) => {
    setIsMenuOpen(isOpen)
  }

  return (
    <AutoRefreshWrapper lastUpdated={formatJapaneseTime(wbgtData.timestamp)}>
      <div className="min-h-screen bg-gray-50">
        {/* ローディング解除 */}
        <LoadingManager />
        
        {/* ヘッダー */}
        <NavigationHeader 
          showBackButton={true} 
          onMenuStateChange={handleMenuStateChange}
        />

        {/* メインコンテンツ */}
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
          {/* お気に入りボタン（固定位置） */}
          <div className="fixed top-20 right-4 z-50 md:top-24 md:right-8">
            <FavoriteButton
              locationCode={locationCode}
              locationName={wbgtData.locationName}
              prefecture={wbgtData.prefecture}
              size="lg"
              className="bg-white shadow-lg hover:shadow-xl"
              hideWhenMenuOpen={true}
              isMenuOpen={isMenuOpen}
            />
          </div>

          {/* メインビジュアライゼーション */}
          <WBGTVisualization
            location={wbgtData.locationName}
            prefecture={wbgtData.prefecture}
            wbgt={wbgtData.wbgt}
            temperature={wbgtData.temperature}
            humidity={wbgtData.humidity}
            updateTime={wbgtData.timestamp}
          />

          {/* 共有ボタンエリア */}
          <ShareButtons
            location={wbgtData.locationName}
            wbgt={wbgtData.wbgt}
            pageUrl={pageUrl}
            qrCodeUrl={pageUrl}
          />

          {/* 運動時対処・活動場所セレクター */}
          <ActivityGuideSelector
            regionCode={getRegionByPrefectureCode(locationCode.slice(0, 2))}
            prefectureCode={locationCode.slice(0, 2)}
            pointCode={locationCode}
            currentWBGTLevel={levelInfo.level}
          />

          {/* 詳細予報テーブル（21時点） */}
          <div data-forecast-section>
            <DetailedForecastTable
              location={wbgtData.locationName}
              prefecture={wbgtData.prefecture}
              updateTime={wbgtData.forecastUpdateTime ? formatForecastUpdateTime(wbgtData.forecastUpdateTime) : formatJapaneseTime(wbgtData.timestamp)}
              forecasts={wbgtData.forecast}
            />
          </div>

          {/* もっと詳しく */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Info className="w-6 h-6" />
              もっと詳しく
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当サイトのデータは、環境省が提供する「
              <a href="https://www.wbgt.env.go.jp/sp/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                熱中症予防情報サイト
              </a>
              」を利用して表示しています。
              <br />
              暑さ指数について詳しい情報をご覧になる場合は
              <a href="https://www.wbgt.env.go.jp/sp/wbgt.php" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                こちら
              </a>
            </p>
          </div>

          {/* QRコード */}
          <QRCodeSection 
            pageUrl={pageUrl}
            locationName={wbgtData.locationName}
            prefecture={wbgtData.prefecture}
          />
        </main>

        {/* スクロールガイド */}
        <ScrollGuide hideThreshold={200} />

        {/* フッター */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-sm">
              <a href="/about" className="hover:text-blue-400">利用規約</a>
              <span className="mx-2">｜</span>
              データ提供：
              <a href="https://www.wbgt.env.go.jp/sp/" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">環境省</a>
              ,
              <a href="https://www.jma.go.jp/jma/index.html" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">気象庁</a>
              <br />
              開発：一橋大学大学院ソーシャル・データサイエンス研究科　
              <a href="https://x.com/masakick" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">山辺真幸</a>
            </p>
          </div>
        </footer>
      </div>
    </AutoRefreshWrapper>
  )
}