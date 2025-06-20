"use client"

import { cn, getWBGTLevel } from "@/lib/utils"
import { Clock } from "lucide-react"

interface ForecastData {
  time: string
  wbgt: number
  temperature?: number
}

interface ForecastCardProps {
  forecasts: ForecastData[]
}

export function ForecastCard({ forecasts }: ForecastCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        今後の予報
      </h3>
      
      {/* スクロール可能な予報リスト */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {forecasts.map((forecast, index) => {
          const level = getWBGTLevel(forecast.wbgt)
          return (
            <div
              key={index}
              className="flex-shrink-0 bg-gray-50 rounded-xl p-4 min-w-[120px] text-center"
            >
              <p className="text-sm text-gray-600 mb-2">{forecast.time}</p>
              <div
                className={cn(
                  "rounded-lg py-2 px-3 text-white font-bold",
                  level.color
                )}
              >
                {forecast.wbgt}°C
              </div>
              <p className="text-xs mt-2 font-medium">{level.label}</p>
              {forecast.temperature && (
                <p className="text-xs text-gray-500 mt-1">
                  気温 {forecast.temperature}°C
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}