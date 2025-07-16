/**
 * 動的な地点別WBGTページ
 * /wbgt/[locationCode] - 841地点に対応
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WeatherReportStructuredData } from '@/components/StructuredData'
import { WBGTLocationPageClient } from '@/components/WBGTLocationPageClient'
import { getWBGTData, getLocationInfoSync } from '@/lib/data-fetcher'
import { getAllLocationCodesArray } from '@/lib/complete-locations'
import { formatJapaneseTime, formatForecastUpdateTime } from '@/lib/format-time'
import { getRedirectPath } from '@/lib/location-redirects'
import { getRegionByPrefectureCode } from '@/lib/region-data'
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

// ISRで定期的に更新
export const revalidate = 900 // 15分間隔

// 840地点すべてに対応するため、未生成パラメータを動的に生成
export const dynamicParams = true

// メタデータ生成 - 固定ブランド情報
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locationCode } = await params
  const locationInfo = getLocationInfoSync(locationCode)
  
  if (!locationInfo) {
    return {
      title: '地点が見つかりません',
      description: '指定された地点の暑さ指数情報が見つかりません。'
    }
  }
  
  // 固定OGP画像
  const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://atsusa.jp'}/og-image.png`
  
  // 固定のブランド情報（リアルタイム情報なし）
  const shareDescription = `${locationInfo.name}（${locationInfo.prefecture}）の暑さ指数をリアルタイムで確認。全国840地点対応の熱中症予防サイト`
  
  return {
    title: `${locationInfo.name}の暑さ指数 - 熱中症予防情報`,
    description: `${locationInfo.name}（${locationInfo.prefecture}）の暑さ指数（WBGT）をリアルタイムで確認。21時点詳細予報と運動指針で熱中症を予防しましょう。`,
    manifest: `/api/manifest/${locationCode}`,
    openGraph: {
      title: `${locationInfo.name}の暑さ指数 - 熱中症予防情報`,
      description: shareDescription,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://atsusa.jp'}/wbgt/${locationCode}`,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: '暑さ指数チェッカー - 全国840地点対応',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${locationInfo.name}の暑さ指数 - 熱中症予防情報`,
      description: shareDescription,
      images: [ogImageUrl],
    },
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
    <>
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
      
      <WBGTLocationPageClient
        locationCode={locationCode}
        wbgtData={wbgtData}
        levelInfo={levelInfo}
        pageUrl={pageUrl}
      />
    </>
  )
}