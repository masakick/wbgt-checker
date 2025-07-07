"use client"

import { useState, useEffect } from "react"
import { MapPin, Activity, ExternalLink } from "lucide-react"

interface ActivityGuideSelectorProps {
  regionCode: string
  prefectureCode: string
  pointCode: string
  currentWBGTLevel?: number // 現在の警戒レベル
}

export function ActivityGuideSelector({
  regionCode,
  prefectureCode,
  pointCode,
  currentWBGTLevel = 2
}: ActivityGuideSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<number>(currentWBGTLevel)
  const [selectedActivity, setSelectedActivity] = useState<string>("")

  // currentWBGTLevelが変更された時にselectedLevelを更新
  useEffect(() => {
    setSelectedLevel(currentWBGTLevel)
  }, [currentWBGTLevel])

  const levels = [
    { value: 0, label: "ほぼ安全", description: "通常通り活動可能", color: "bg-blue-500" },
    { value: 1, label: "注意", description: "積極的に水分補給", color: "bg-green-500" },
    { value: 2, label: "警戒", description: "熱中症の危険が増すので、積極的に休息をとり適宜、水分・塩分を補給する。激しい運動では、30分おきくらいに休息をとる。", color: "bg-yellow-500" },
    { value: 3, label: "厳重警戒", description: "激しい運動は中止", color: "bg-orange-500" },
    { value: 4, label: "危険", description: "すべての活動を中止", color: "bg-red-600" }
  ]

  const activities = [
    { value: "", label: "活動場所を選択" },
    { value: `https://www.wbgt.env.go.jp/sp/graph_ref_td.php?region=${regionCode}&prefecture=${prefectureCode}&point=${pointCode}&refId=2`, label: "駐車場" },
    { value: `https://www.wbgt.env.go.jp/sp/graph_ref_td.php?region=${regionCode}&prefecture=${prefectureCode}&point=${pointCode}&refId=3`, label: "交差点" },
    { value: `https://www.wbgt.env.go.jp/sp/graph_ref_td.php?region=${regionCode}&prefecture=${prefectureCode}&point=${pointCode}&refId=4`, label: "バス停" },
    { value: `https://www.wbgt.env.go.jp/sp/graph_ref_td.php?region=${regionCode}&prefecture=${prefectureCode}&point=${pointCode}&refId=5`, label: "住宅地" },
    { value: `https://www.wbgt.env.go.jp/sp/graph_ref_td.php?region=${regionCode}&prefecture=${prefectureCode}&point=${pointCode}&refId=6`, label: "子供・車いす" },
    { value: `https://www.wbgt.env.go.jp/sp/graph_ref_td.php?region=${regionCode}&prefecture=${prefectureCode}&point=${pointCode}&refId=7`, label: "温室" },
    { value: `https://www.wbgt.env.go.jp/sp/graph_ref_td.php?region=${regionCode}&prefecture=${prefectureCode}&point=${pointCode}&refId=8`, label: "体育館" }
  ]

  const currentLevel = levels[selectedLevel]

  const handleActivityChange = (value: string) => {
    setSelectedActivity(value)
    if (value) {
      window.open(value, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      {/* 運動時の対処 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          運動時の対処
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              警戒レベルを選択
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {levels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className={`p-4 rounded-lg text-white ${currentLevel.color}`}>
            <h3 className="font-bold text-base md:text-lg mb-2">{currentLevel.label}</h3>
            <p className="text-sm md:text-base">{currentLevel.description}</p>
          </div>
        </div>
      </div>

      {/* 活動場所別の指数 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          活動場所別の指数を見る
        </h2>
        
        <p className="text-gray-600 mb-4">
          活動場所を選ぶと環境省のサイトへ移動します
        </p>

        <div className="relative">
          <select
            value={selectedActivity}
            onChange={(e) => handleActivityChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
          >
            {activities.map((activity, index) => (
              <option key={index} value={activity.value}>
                {activity.label}
              </option>
            ))}
          </select>
          <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}