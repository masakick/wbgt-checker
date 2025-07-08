"use client"

import { cn, getWBGTLevel, getSportsGuideline } from "@/lib/utils"
import { Clock } from "lucide-react"

interface ForecastData {
  date: string
  time: string
  wbgt: number
  level: number
  label: string
  guidance: string
}

interface DetailedForecastTableProps {
  location: string
  prefecture: string
  updateTime: string
  forecasts: ForecastData[]
}

export function DetailedForecastTable({
  location,
  prefecture,
  updateTime,
  forecasts
}: DetailedForecastTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">
          3時間ごとの暑さ指数予測
        </h2>
        <p className="flex items-center gap-2 opacity-90">
          <Clock className="w-4 h-4" />
          {location}({prefecture}) {updateTime}更新
        </p>
      </div>

      {/* デスクトップ用テーブル */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">日付</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">時刻</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">WBGT</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">警戒レベル</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">運動指針</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {forecasts.map((forecast, index) => {
              const level = getWBGTLevel(forecast.wbgt)
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-700">{forecast.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{forecast.time}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-white font-bold text-sm",
                        level.color
                      )}
                    >
                      {forecast.wbgt}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "inline-block px-2 py-1 rounded text-white text-xs font-medium",
                        level.color
                      )}
                    >
                      {level.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{forecast.guidance}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* モバイル用カードレイアウト */}
      <div className="md:hidden space-y-3 p-4">
        {forecasts.map((forecast, index) => {
          const level = getWBGTLevel(forecast.wbgt)
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700">
                  {forecast.date} {forecast.time}
                </div>
                <span
                  className={cn(
                    "inline-block px-3 py-1 rounded-full text-white font-bold text-sm",
                    level.color
                  )}
                >
                  {forecast.wbgt}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={cn(
                    "inline-block px-2 py-1 rounded text-white text-xs font-medium",
                    level.color
                  )}
                >
                  {level.label}
                </span>
              </div>
              <div className="text-xs text-gray-600">{forecast.guidance}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}