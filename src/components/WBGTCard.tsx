"use client"

import { cn, getWBGTLevel, getSportsGuideline } from "@/lib/utils"
import { Thermometer, AlertTriangle, Droplets } from "lucide-react"

interface WBGTCardProps {
  location: string
  prefecture: string
  wbgt: number
  temperature: number
  humidity: number
  updateTime: string
}

export function WBGTCard({
  location,
  prefecture,
  wbgt,
  temperature,
  humidity,
  updateTime,
}: WBGTCardProps) {
  const wbgtLevel = getWBGTLevel(wbgt)
  const sportsGuideline = getSportsGuideline(wbgt)

  return (
    <div
      className={cn(
        "rounded-3xl p-6 text-white shadow-2xl transition-all duration-300",
        "bg-gradient-to-br",
        wbgtLevel.level === 0 && "from-blue-400 to-blue-600",
        wbgtLevel.level === 1 && "from-green-400 to-green-600",
        wbgtLevel.level === 2 && "from-yellow-400 to-yellow-600",
        wbgtLevel.level === 3 && "from-orange-400 to-orange-600",
        wbgtLevel.level === 4 && "from-red-500 to-red-700"
      )}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{location}</h2>
          <p className="text-sm opacity-90">{prefecture}</p>
        </div>
        {wbgtLevel.level >= 3 && (
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        )}
      </div>

      {/* WBGT値 */}
      <div className="text-center mb-6">
        <div className="text-6xl font-black mb-2">{wbgt}°C</div>
        <div className="text-2xl font-semibold">{wbgtLevel.label}</div>
      </div>

      {/* 詳細情報 */}
      <div className="space-y-3 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            <span>気温</span>
          </div>
          <span className="font-semibold">{temperature}°C</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            <span>湿度</span>
          </div>
          <span className="font-semibold">{humidity}%</span>
        </div>
      </div>

      {/* スポーツ活動指針 */}
      <div className="mt-4 p-3 bg-white/20 rounded-xl backdrop-blur-sm">
        <p className="text-sm font-medium">スポーツ活動指針</p>
        <p className="text-lg font-semibold">{sportsGuideline}</p>
      </div>

      {/* 更新時刻 */}
      <p className="text-xs text-white/70 mt-4 text-center">
        最終更新: {updateTime}
      </p>
    </div>
  )
}