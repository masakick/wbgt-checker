import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// WBGT警戒レベルの定義
export const getWBGTLevel = (wbgt: number) => {
  if (wbgt < 21) return { level: 0, label: "ほぼ安全", color: "bg-blue-500" }
  if (wbgt < 25) return { level: 1, label: "注意", color: "bg-green-500" }
  if (wbgt < 28) return { level: 2, label: "警戒", color: "bg-yellow-500" }
  if (wbgt < 31) return { level: 3, label: "厳重警戒", color: "bg-orange-500" }
  return { level: 4, label: "危険", color: "bg-red-600" }
}

// スポーツ活動の指針
export const getSportsGuideline = (wbgt: number) => {
  if (wbgt < 21) return "通常通り活動可能"
  if (wbgt < 25) return "積極的に水分補給"
  if (wbgt < 28) return "激しい運動は中止"
  if (wbgt < 31) return "運動は原則中止"
  return "すべての活動を中止"
}