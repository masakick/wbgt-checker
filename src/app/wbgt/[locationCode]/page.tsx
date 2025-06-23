/**
 * 動的な地点別WBGTページ
 * /wbgt/[locationCode] - 841地点に対応
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WBGTVisualization } from '@/components/WBGTVisualization'
import { DetailedForecastTable } from '@/components/DetailedForecastTable'
import { ActivityGuideSelector } from '@/components/ActivityGuideSelector'
import { ShareAndSaveButtons } from '@/components/ShareAndSaveButtons'
import { QRCodeSection } from '@/components/QRCodeSection'
import { NavigationHeader } from '@/components/NavigationHeader'
import { FavoriteButton } from '@/components/FavoriteButton'
import { WeatherReportStructuredData } from '@/components/StructuredData'
import { Info } from 'lucide-react'
import { getWBGTData, getLocationInfoSync } from '@/lib/data-fetcher'
import { getAllLocationCodesArray } from '@/lib/complete-locations'
import { formatJapaneseTime } from '@/lib/format-time'
import { getRedirectPath } from '@/lib/location-redirects'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{
    locationCode: string
  }>
}

// 静的生成パラメータの設定
export async function generateStaticParams() {
  // 主要地点（都道府県庁所在地など）のみ事前生成
  // 他の840地点は動的に生成（ISR）
  const majorLocations = [
    '44132', // 東京
    '46106', // 横浜
    '62078', // 大阪
    '51106', // 名古屋
    '82182', // 福岡
    '14163', // 札幌
    '48141', // 白馬（長野代表）
    '34392', // 仙台
    '67437', // 広島
    '86141', // 熊本
    '63518', // 神戸
    '91197', // 那覇
    '52586', // 岐阜
    '54232', // 新潟
    '56227', // 金沢
    '71106', // 徳島
    '74181', // 高知
    '68132', // 松江
    '69122', // 鳥取
    '87376', // 宮崎
    '88317', // 鹿児島
    '55102', // 富山
    '57066', // 福井
    '60216', // 大津
    '61286', // 京都
    '64036', // 奈良
    '65042', // 和歌山
    '31312', // 青森
    '32402', // 秋田
    '33431', // 盛岡
    '35426', // 山形
    '36127', // 福島
    '40201', // 水戸
    '41277', // 宇都宮
    '42251', // 前橋
    '43241', // さいたま
    '45212', // 千葉
    '49142', // 甲府
    '50331', // 静岡
    '53133', // 津
    '66408', // 岡山
    '72086', // 高松
    '73166', // 松山
    '83216', // 大分
    '84496', // 長崎
    '85142'  // 佐賀
  ]
  
  return majorLocations.map((locationCode) => ({
    locationCode
  }))
}

// ISR設定 - 1時間ごとに再生成
export const revalidate = 3600

// 840地点すべてに対応するため、未生成パラメータを動的に生成
export const dynamicParams = true

// メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locationCode } = await params
  const locationInfo = getLocationInfoSync(locationCode)
  
  if (!locationInfo) {
    return {
      title: '地点が見つかりません',
      description: '指定された地点の暑さ指数情報が見つかりません。'
    }
  }
  
  // Get current WBGT data for OGP
  const wbgtData = await getWBGTData(locationCode)
  const ogImageUrl = wbgtData 
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/api/og?location=${encodeURIComponent(locationInfo.name)}&wbgt=${wbgtData.wbgt}&temp=${wbgtData.temperature}&humidity=${wbgtData.humidity}`
    : undefined
  
  return {
    title: `${locationInfo.name}の暑さ指数 - 熱中症予防情報`,
    description: `${locationInfo.name}（${locationInfo.prefecture}）の暑さ指数（WBGT）をリアルタイムで確認。21時点詳細予報と運動指針で熱中症を予防しましょう。`,
    openGraph: {
      title: `${locationInfo.name}の暑さ指数`,
      description: `現在の暑さ指数とともに熱中症予防情報をお届けします`,
      url: `https://your-domain.com/wbgt/${locationCode}`,
      type: 'website',
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${locationInfo.name}の暑さ指数`,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${locationInfo.name}の暑さ指数`,
      description: `現在の暑さ指数とともに熱中症予防情報をお届けします`,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    }
  }
}

export default async function WBGTLocationPage({ params }: PageProps) {
  const { locationCode } = await params
  
  // リダイレクトチェック
  const redirectPath = getRedirectPath(locationCode)
  if (redirectPath) {
    redirect(redirectPath)
  }
  
  // データ取得
  const wbgtData = await getWBGTData(locationCode)
  
  if (!wbgtData) {
    notFound()
  }
  
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/wbgt/${locationCode}`
  

  // Get WBGT level info
  const { getWBGTLevel } = await import('@/lib/data-processor')
  const levelInfo = getWBGTLevel(wbgtData.wbgt)

  return (
    <div className="min-h-screen bg-gray-50">
      <WeatherReportStructuredData
        locationCode={locationCode}
        locationName={wbgtData.locationName}
        prefecture={wbgtData.prefecture}
        wbgt={wbgtData.wbgt}
        temperature={wbgtData.temperature}
        humidity={wbgtData.humidity}
        level={levelInfo}
        timestamp={wbgtData.timestamp}
      />
      
      {/* ヘッダー */}
      <NavigationHeader showBackButton={true} />

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

        {/* 共有・保存ボタンエリア */}
        <ShareAndSaveButtons
          location={wbgtData.locationName}
          wbgt={wbgtData.wbgt}
          pageUrl={pageUrl}
          qrCodeUrl={pageUrl}
        />

        {/* 運動時対処・活動場所セレクター */}
        <ActivityGuideSelector
          regionCode={locationCode.slice(0, 2)}
          prefectureCode={locationCode.slice(0, 2)}
          pointCode={locationCode}
        />

        {/* 詳細予報テーブル（21時点） */}
        <DetailedForecastTable
          location={wbgtData.locationName}
          prefecture={wbgtData.prefecture}
          updateTime={formatJapaneseTime(wbgtData.timestamp)}
          forecasts={wbgtData.forecast}
        />

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
        <QRCodeSection pageUrl={pageUrl} />
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">
            <a href="#" className="hover:text-blue-400">利用規約</a>
            <span className="mx-2">｜</span>
            データ提供：
            <a href="https://www.wbgt.env.go.jp/sp/" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">環境省</a>
            ,
            <a href="https://www.jma.go.jp/jma/index.html" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">気象庁</a>
            <br />
            開発：慶應義塾大学大学院 政策・メディア研究科 
            <a href="https://twitter.com/masakick" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">山辺真幸</a>
          </p>
        </div>
      </footer>
    </div>
  )
}