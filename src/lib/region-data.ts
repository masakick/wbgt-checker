/**
 * 地方・都道府県データ（../dist/index.jsから移植）
 */

export interface RegionData {
  id: string
  name: string
}

export interface PrefectureData {
  id: string
  name: string
}

// 地方情報（11地方）
export const regions: RegionData[] = [
  { id: "01", name: "北海道地方" },
  { id: "02", name: "東北地方" },
  { id: "03", name: "関東地方" },
  { id: "04", name: "甲信地方" },
  { id: "05", name: "東海地方" },
  { id: "06", name: "北陸地方" },
  { id: "07", name: "近畿地方" },
  { id: "08", name: "中国地方" },
  { id: "09", name: "四国地方" },
  { id: "10", name: "九州地方" },
  { id: "11", name: "沖縄地方" }
]

// 都道府県情報（地方別）
export const prefecturesByRegion: Record<string, PrefectureData[]> = {
  "01": [
    { id: "11", name: "宗谷" },
    { id: "12", name: "上川" },
    { id: "13", name: "留萌" },
    { id: "14", name: "石狩" },
    { id: "15", name: "空知" },
    { id: "16", name: "後志" },
    { id: "17", name: "ｵﾎｰﾂｸ" },
    { id: "18", name: "根室" },
    { id: "19", name: "釧路" },
    { id: "20", name: "十勝" },
    { id: "21", name: "胆振" },
    { id: "22", name: "日高" },
    { id: "23", name: "渡島" },
    { id: "24", name: "檜山" }
  ],
  "02": [
    { id: "31", name: "青森" },
    { id: "32", name: "秋田" },
    { id: "33", name: "岩手" },
    { id: "34", name: "宮城" },
    { id: "35", name: "山形" },
    { id: "36", name: "福島" }
  ],
  "03": [
    { id: "40", name: "茨城" },
    { id: "41", name: "栃木" },
    { id: "42", name: "群馬" },
    { id: "43", name: "埼玉" },
    { id: "44", name: "東京" },
    { id: "45", name: "千葉" },
    { id: "46", name: "神奈川" }
  ],
  "04": [
    { id: "48", name: "長野" },
    { id: "49", name: "山梨" }
  ],
  "05": [
    { id: "50", name: "静岡" },
    { id: "51", name: "愛知" },
    { id: "52", name: "岐阜" },
    { id: "53", name: "三重" }
  ],
  "06": [
    { id: "54", name: "新潟" },
    { id: "55", name: "富山" },
    { id: "56", name: "石川" },
    { id: "57", name: "福井" }
  ],
  "07": [
    { id: "60", name: "滋賀" },
    { id: "61", name: "京都" },
    { id: "62", name: "大阪" },
    { id: "63", name: "兵庫" },
    { id: "64", name: "奈良" },
    { id: "65", name: "和歌山" }
  ],
  "08": [
    { id: "66", name: "岡山" },
    { id: "67", name: "広島" },
    { id: "68", name: "島根" },
    { id: "69", name: "鳥取" },
    { id: "81", name: "山口" }
  ],
  "09": [
    { id: "71", name: "徳島" },
    { id: "72", name: "香川" },
    { id: "73", name: "愛媛" },
    { id: "74", name: "高知" }
  ],
  "10": [
    { id: "82", name: "福岡" },
    { id: "83", name: "大分" },
    { id: "84", name: "長崎" },
    { id: "85", name: "佐賀" },
    { id: "86", name: "熊本" },
    { id: "87", name: "宮崎" },
    { id: "88", name: "鹿児島" }
  ],
  "11": [
    { id: "9194", name: "沖縄" }
  ]
}

/**
 * 地方IDから地方名を取得
 */
export function getRegionName(regionId: string): string {
  const region = regions.find(r => r.id === regionId)
  return region?.name || ''
}

/**
 * 都道府県IDから都道府県名を取得
 */
export function getPrefectureName(prefectureId: string, regionId?: string): string {
  if (regionId) {
    const prefectures = prefecturesByRegion[regionId]
    const prefecture = prefectures?.find(p => p.id === prefectureId)
    return prefecture?.name || ''
  }
  
  // 全地方から検索
  for (const regionPrefectures of Object.values(prefecturesByRegion)) {
    const prefecture = regionPrefectures.find(p => p.id === prefectureId)
    if (prefecture) return prefecture.name
  }
  
  return ''
}

/**
 * 地方から都道府県リストを取得
 */
export function getPrefecturesByRegion(regionId: string): PrefectureData[] {
  return prefecturesByRegion[regionId] || []
}

/**
 * 都道府県コードから地域コードを取得
 */
export function getRegionByPrefectureCode(prefectureCode: string): string {
  for (const [regionId, prefectures] of Object.entries(prefecturesByRegion)) {
    if (prefectures.some(p => p.id === prefectureCode)) {
      return regionId
    }
  }
  return "03" // デフォルト（関東地方）
}