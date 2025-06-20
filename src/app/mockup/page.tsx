"use client"

import { useState } from "react"
import { WBGTCard } from "@/components/WBGTCard"
import { ForecastCard } from "@/components/ForecastCard"
import { LocationSelector } from "@/components/LocationSelector"
import { ArrowLeft, Share2, Heart, Home } from "lucide-react"

// モックデータ
const mockLocationData = {
  regions: {
    "01": "北海道",
    "02": "東北",
    "03": "関東",
    "04": "中部",
    "05": "近畿",
    "06": "中国",
    "07": "四国",
    "08": "九州",
    "09": "沖縄"
  },
  prefectures: {
    "01": [
      { code: "11", name: "宗谷" },
      { code: "12", name: "上川" },
      { code: "13", name: "留萌" }
    ],
    "03": [
      { code: "31", name: "茨城県" },
      { code: "32", name: "栃木県" },
      { code: "33", name: "群馬県" },
      { code: "34", name: "埼玉県" },
      { code: "35", name: "千葉県" },
      { code: "36", name: "東京都" },
      { code: "37", name: "神奈川県" }
    ]
  },
  locations: {
    "11": [
      { code: "11001", name: "宗谷岬" },
      { code: "11016", name: "稚内" }
    ],
    "36": [
      { code: "36061", name: "東京" },
      { code: "36066", name: "八王子" },
      { code: "36106", name: "大島" }
    ]
  }
}

const mockForecastData = [
  { time: "12:00", wbgt: 28.5, temperature: 32.1 },
  { time: "15:00", wbgt: 30.2, temperature: 33.5 },
  { time: "18:00", wbgt: 27.8, temperature: 30.2 },
  { time: "21:00", wbgt: 25.4, temperature: 27.8 },
  { time: "24:00", wbgt: 24.1, temperature: 26.5 },
]

export default function MockupPage() {
  const [currentView, setCurrentView] = useState<"selector" | "detail">("selector")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)

  const handleLocationSelect = (code: string) => {
    setSelectedLocation(code)
    setCurrentView("detail")
  }

  const handleBack = () => {
    setCurrentView("selector")
  }

  if (currentView === "selector") {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <LocationSelector
          data={mockLocationData}
          onLocationSelect={handleLocationSelect}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-semibold">暑さ指数チェッカー</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* WBGTカード */}
        <WBGTCard
          location="東京"
          prefecture="東京都"
          wbgt={28.5}
          temperature={32.1}
          humidity={65}
          updateTime="2025年6月20日 14:40"
        />

        {/* 予報カード */}
        <ForecastCard forecasts={mockForecastData} />

        {/* 熱中症対策アドバイス */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">熱中症対策アドバイス</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-2xl">💧</span>
              <div>
                <p className="font-semibold">こまめな水分補給</p>
                <p className="text-sm text-gray-600">
                  喉が渇く前に定期的に水分を摂取しましょう
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="font-semibold">涼しい場所で休憩</p>
                <p className="text-sm text-gray-600">
                  エアコンの効いた室内で定期的に休憩を取りましょう
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">👕</span>
              <div>
                <p className="font-semibold">適切な服装</p>
                <p className="text-sm text-gray-600">
                  通気性の良い軽い色の服を着用しましょう
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* 更新情報 */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm">
          <p className="text-blue-800">
            データは環境省「熱中症予防情報サイト」より取得しています。
            毎時40分頃に更新されます。
          </p>
        </div>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-3xl mx-auto px-4 py-2 flex justify-around">
          <button className="flex flex-col items-center gap-1 p-2 text-blue-500">
            <Home className="w-6 h-6" />
            <span className="text-xs">ホーム</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-gray-400">
            <Heart className="w-6 h-6" />
            <span className="text-xs">お気に入り</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-gray-400">
            <Share2 className="w-6 h-6" />
            <span className="text-xs">共有</span>
          </button>
        </div>
      </nav>
    </div>
  )
}