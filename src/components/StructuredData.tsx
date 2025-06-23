/**
 * JSON-LD structured data component
 */

interface StructuredDataProps {
  type: 'WebSite' | 'Place' | 'WeatherReport'
  data: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// WebSite structured data for homepage
export function WebSiteStructuredData() {
  const data = {
    name: '暑さ指数チェッカー',
    alternateName: 'WBGT熱中症予防情報',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
    description: '日本全国841地点の暑さ指数（WBGT）をリアルタイムでチェック。熱中症予防に役立つ情報を提供します。',
    publisher: {
      '@type': 'Organization',
      name: '慶應義塾大学大学院 政策・メディア研究科',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/icons/icon-512x512.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return <StructuredData type="WebSite" data={data} />
}

// WeatherReport structured data for location pages
interface WeatherReportProps {
  locationCode: string
  locationName: string
  prefecture: string
  wbgt: number
  temperature: number
  humidity: number
  level: {
    level: number
    label: string
    guidance: string
  }
  timestamp: string
}

export function WeatherReportStructuredData({
  locationCode,
  locationName,
  prefecture,
  wbgt,
  temperature,
  humidity,
  level,
  timestamp,
}: WeatherReportProps) {
  const data = {
    provider: {
      '@type': 'Organization',
      name: '環境省・気象庁',
    },
    spatialCoverage: {
      '@type': 'Place',
      name: locationName,
      address: {
        '@type': 'PostalAddress',
        addressRegion: prefecture,
        addressCountry: 'JP',
      },
    },
    datePublished: timestamp,
    validThrough: new Date(new Date(timestamp).getTime() + 3600000).toISOString(), // Valid for 1 hour
    weatherCondition: `暑さ指数 ${wbgt}°C - ${level.label}`,
    temperature: {
      '@type': 'QuantitativeValue',
      value: temperature,
      unitCode: 'CEL',
    },
    humidity: {
      '@type': 'QuantitativeValue',
      value: humidity,
      unitCode: 'P1',
    },
    // Custom WBGT data
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'WBGT（暑さ指数）',
        value: wbgt,
        unitCode: 'CEL',
      },
      {
        '@type': 'PropertyValue',
        name: '警戒レベル',
        value: level.label,
      },
      {
        '@type': 'PropertyValue',
        name: '運動指針',
        value: level.guidance,
      },
    ],
  }

  return <StructuredData type="WeatherReport" data={data} />
}