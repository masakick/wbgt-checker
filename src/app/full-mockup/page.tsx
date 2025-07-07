"use client"

import { WBGTVisualization } from "@/components/WBGTVisualization"
import { DetailedForecastTable } from "@/components/DetailedForecastTable"
import { ActivityGuideSelector } from "@/components/ActivityGuideSelector"
import { ShareButtons } from "@/components/ShareButtons"
import { QRCodeSection } from "@/components/QRCodeSection"
import { ArrowLeft, RefreshCw, Info } from "lucide-react"

// 21時点の詳細予報データ（現在システムと同等）
const mockDetailedForecast = [
  { date: "6月20日", time: "12時", wbgt: 28, level: 3, label: "厳重警戒", guidance: "激しい運動は中止" },
  { date: "6月20日", time: "15時", wbgt: 29, level: 3, label: "厳重警戒", guidance: "激しい運動は中止" },
  { date: "6月20日", time: "18時", wbgt: 25, level: 2, label: "警戒", guidance: "積極的に休息" },
  { date: "6月20日", time: "21時", wbgt: 23, level: 1, label: "注意", guidance: "積極的に水分補給" },
  { date: "6月20日", time: "24時", wbgt: 23, level: 1, label: "注意", guidance: "積極的に水分補給" },
  { date: "6月21日", time: "3時", wbgt: 22, level: 1, label: "注意", guidance: "積極的に水分補給" },
  { date: "6月21日", time: "6時", wbgt: 24, level: 1, label: "注意", guidance: "積極的に水分補給" },
  { date: "6月21日", time: "9時", wbgt: 28, level: 3, label: "厳重警戒", guidance: "激しい運動は中止" },
  { date: "6月21日", time: "12時", wbgt: 29, level: 3, label: "厳重警戒", guidance: "激しい運動は中止" },
  { date: "6月21日", time: "15時", wbgt: 27, level: 2, label: "警戒", guidance: "積極的に休息" },
  { date: "6月21日", time: "18時", wbgt: 25, level: 2, label: "警戒", guidance: "積極的に休息" },
  { date: "6月21日", time: "21時", wbgt: 24, level: 1, label: "注意", guidance: "積極的に水分補給" },
  { date: "6月21日", time: "24時", wbgt: 22, level: 1, label: "注意", guidance: "積極的に水分補給" },
  { date: "6月22日", time: "3時", wbgt: 21, level: 1, label: "注意", guidance: "積極的に水分補給" },
  { date: "6月22日", time: "6時", wbgt: 22, level: 1, label: "注意", guidance: "積極的に水分補給" },
  { date: "6月22日", time: "9時", wbgt: 27, level: 2, label: "警戒", guidance: "積極的に休息" },
  { date: "6月22日", time: "12時", wbgt: 29, level: 3, label: "厳重警戒", guidance: "激しい運動は中止" },
  { date: "6月22日", time: "15時", wbgt: 27, level: 2, label: "警戒", guidance: "積極的に休息" },
  { date: "6月22日", time: "18時", wbgt: 24, level: 1, label: "注意", guidance: "積極的に水分補給" },
  { date: "6月22日", time: "21時", wbgt: 22, level: 1, label: "注意", guidance: "積極的に水分補給" },
  { date: "6月22日", time: "24時", wbgt: 22, level: 1, label: "注意", guidance: "積極的に水分補給" },
]

export default function FullMockupPage() {
  const handleDataReload = () => {
    // データ再読込み処理
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600">このサイトについて</a>
              <span className="mx-2">｜</span>
              <a href="#" className="hover:text-blue-600">地点を選択</a>
              <span className="mx-2">｜</span>
              <button onClick={handleDataReload} className="hover:text-blue-600 flex items-center gap-1">
                <RefreshCw className="w-4 h-4" />
                データ再読込み
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* メインビジュアライゼーション（p5.js代替） */}
        <WBGTVisualization
          location="東京"
          prefecture="東京"
          wbgt={28.5}
          temperature={32.1}
          humidity={65}
          updateTime="2025年6月20日 14:40"
        />

        {/* 共有ボタンエリア */}
        <ShareButtons
          location="東京"
          wbgt={28.5}
          pageUrl="https://atsusa.jp/wbgt/44132.html"
          qrCodeUrl="/qr/https_atsusa.jp_wbgt_44132.html.png"
        />

        {/* 運動時対処・活動場所セレクター */}
        <ActivityGuideSelector
          regionCode="03"
          prefectureCode="44"
          pointCode="44132"
          currentWBGTLevel={3}
        />

        {/* 詳細予報テーブル（21時点） */}
        <DetailedForecastTable
          location="東京"
          prefecture="東京"
          updateTime="2025/06/20 10:25"
          forecasts={mockDetailedForecast}
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
        <QRCodeSection 
          pageUrl="https://atsusa.jp/wbgt/44132.html"
          locationName="東京"
          prefecture="東京都"
        />
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">
            <a href="/about" className="hover:text-blue-400">利用規約</a>
            <span className="mx-2">｜</span>
            データ提供：
            <a href="https://www.wbgt.env.go.jp/sp/" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">環境省</a>
            ,
            <a href="https://www.jma.go.jp/jma/index.html" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">気象庁</a>
            <br />
            開発：一橋大学大学院ソーシャル・データサイエンス研究科　山辺真幸
          </p>
        </div>
      </footer>
    </div>
  )
}