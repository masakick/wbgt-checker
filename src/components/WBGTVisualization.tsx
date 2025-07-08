"use client"

import { cn, getWBGTLevel } from "@/lib/utils"
import { Thermometer, Droplets, Clock, Zap } from "lucide-react"
import { formatJapaneseTime } from "@/lib/format-time"

interface WBGTVisualizationProps {
  location: string
  prefecture: string
  wbgt: number
  temperature: number
  humidity: number
  updateTime: string
}

export function WBGTVisualization({
  location,
  prefecture,
  wbgt,
  temperature,
  humidity,
  updateTime,
}: WBGTVisualizationProps) {
  const wbgtLevel = getWBGTLevel(wbgt)

  // 現行サイトと同じalert_noticeとalert_description
  const alertNotice = ["適宜水分補給","積極的に水分補給","積極的に休息","激しい運動は中止","運動は原則中止"];
  const alertDescription = [
    '', // ほぼ安全は空文字
    '一般に危険性は少ないが激しい運動や\n重労働時には発生する危険性がある',
    '運動や激しい作業をする際は\n定期的に充分に休息を取り入れる',
    '外出時は炎天下を避け、室内では室温の上昇に注意',
    '高齢者においては安静状態でも発生する危険性が大きい\n外出はなるべく避け、涼しい室内に移動'
  ];

  return (
    <div className="w-full h-[600px] md:h-[800px] relative overflow-hidden rounded-3xl shadow-2xl">
      {/* 背景グラデーション */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          wbgtLevel.level === 0 && "from-blue-400 via-blue-500 to-blue-600",
          wbgtLevel.level === 1 && "from-green-400 via-green-500 to-green-600",
          wbgtLevel.level === 2 && "from-yellow-400 via-yellow-500 to-yellow-600",
          wbgtLevel.level === 3 && "from-orange-400 via-orange-500 to-orange-600",
          wbgtLevel.level === 4 && "from-red-500 via-red-600 to-red-700"
        )}
      />

      {/* アニメーション背景パターン */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* メインコンテンツ */}
      <div className="relative h-full flex flex-col justify-between p-8 text-white">
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{location}（{prefecture}）の暑さ指数</h1>
          <div className="flex items-center justify-center gap-2 text-sm opacity-90">
            <Clock className="w-4 h-4" />
            <span>最終更新: {formatJapaneseTime(updateTime)}</span>
          </div>
        </div>

        {/* 中央の大きな表示 */}
        <div className="text-center space-y-6">
          {/* WBGT値 */}
          <div className="space-y-4">
            <div className="text-8xl md:text-9xl font-black tracking-tight">
              {wbgt}
            </div>
            <div className="text-3xl md:text-4xl font-bold">
              {wbgtLevel.label}
            </div>
            
            {/* alert_notice */}
            <div className="text-xl md:text-2xl font-semibold">
              {alertNotice[wbgtLevel.level]}
            </div>
            
            {/* alert_description */}
            {alertDescription[wbgtLevel.level] && (
              <div className="text-base md:text-lg max-w-md mx-auto leading-relaxed whitespace-pre-line">
                {alertDescription[wbgtLevel.level]}
              </div>
            )}
            
            {wbgtLevel.level >= 3 && (
              <div className="flex items-center justify-center gap-2 text-xl animate-pulse">
                <Zap className="w-6 h-6" />
                <span>注意が必要です</span>
                <Zap className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* 詳細データ */}
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Thermometer className="w-6 h-6" />
                <span className="text-lg font-semibold">気温</span>
              </div>
              <div className="text-3xl font-bold">{temperature}°C</div>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Droplets className="w-6 h-6" />
                <span className="text-lg font-semibold">湿度</span>
              </div>
              <div className="text-3xl font-bold">{humidity}%</div>
            </div>
          </div>
        </div>

        {/* 下部スペース */}
        <div></div>
      </div>
    </div>
  )
}