"use client"

import { useState } from "react"
import { MapPin, ChevronRight } from "lucide-react"

interface LocationData {
  regions: { [key: string]: string }
  prefectures: { [key: string]: Array<{ code: string; name: string }> }
  locations: { [key: string]: Array<{ code: string; name: string }> }
}

interface LocationSelectorProps {
  data: LocationData
  onLocationSelect: (code: string) => void
}

export function LocationSelector({ data, onLocationSelect }: LocationSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("")

  const handleRegionSelect = (regionCode: string) => {
    setSelectedRegion(regionCode)
    setSelectedPrefecture("")
  }

  const handlePrefectureSelect = (prefCode: string) => {
    setSelectedPrefecture(prefCode)
  }

  const handleLocationSelect = (locationCode: string) => {
    onLocationSelect(locationCode)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* タイトル */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">暑さ指数(WBGT)をチェック</h1>
        <p className="text-gray-600">お住まいの地域を選択してください</p>
      </div>

      {/* 地域選択 */}
      {!selectedRegion && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            地域を選択
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(data.regions).map(([code, name]) => (
              <button
                key={code}
                onClick={() => handleRegionSelect(code)}
                className="bg-gray-50 hover:bg-blue-50 rounded-xl p-4 text-left transition-colors duration-200 flex items-center justify-between group"
              >
                <span className="font-medium">{name}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 都道府県選択 */}
      {selectedRegion && !selectedPrefecture && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={() => setSelectedRegion("")}
            className="mb-4 text-blue-500 hover:text-blue-600 font-medium"
          >
            ← 地域選択に戻る
          </button>
          <h2 className="text-xl font-semibold mb-4">都道府県を選択</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.prefectures[selectedRegion]?.map((pref) => (
              <button
                key={pref.code}
                onClick={() => handlePrefectureSelect(pref.code)}
                className="bg-gray-50 hover:bg-blue-50 rounded-xl p-4 text-left transition-colors duration-200 flex items-center justify-between group"
              >
                <span className="font-medium">{pref.name}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 観測地点選択 */}
      {selectedPrefecture && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={() => setSelectedPrefecture("")}
            className="mb-4 text-blue-500 hover:text-blue-600 font-medium"
          >
            ← 都道府県選択に戻る
          </button>
          <h2 className="text-xl font-semibold mb-4">観測地点を選択</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {data.locations[selectedPrefecture]?.map((location) => (
              <button
                key={location.code}
                onClick={() => handleLocationSelect(location.code)}
                className="bg-gray-50 hover:bg-blue-50 rounded-xl p-4 text-left transition-colors duration-200 flex items-center justify-between group"
              >
                <span className="font-medium">{location.name}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}