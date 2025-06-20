/**
 * データ処理・変換ユーティリティ
 */

import { getAllCompleteLocations } from './complete-locations'

export interface WBGTData {
  locationCode: string
  locationName: string
  prefecture: string
  wbgt: number
  temperature: number
  humidity: number
  timestamp: string
  forecast: WBGTForecast[]
}

export interface WBGTForecast {
  date: string
  time: string
  wbgt: number
  level: number
  label: string
  guidance: string
}

export interface TemperatureData {
  locationCode: string
  temperature: number
  humidity: number
  timestamp: string
}

/**
 * 環境省CSVデータをパース
 * CSVの形式: Date,Time,11001,11016,11046,... (横軸が地点コード、縦軸が時刻)
 */
export function parseWBGTCSV(csvText: string): WBGTData[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  
  if (lines.length < 2) {
    throw new Error('Invalid CSV format: insufficient data')
  }
  
  // ヘッダー行から地点コードを抽出
  const headerColumns = lines[0].split(',')
  const locationCodes = headerColumns.slice(2) // Date,Timeの後から地点コード
  
  // 最新の時刻データ（最後の有効な行）を使用
  let latestDataLine = ''
  let latestColumns: string[] = []
  
  // 最後から有効なデータ行を探す
  for (let i = lines.length - 1; i >= 1; i--) {
    const testColumns = lines[i].split(',')
    if (testColumns.length >= 3 && testColumns[2].trim() !== '') {
      latestDataLine = lines[i]
      latestColumns = testColumns
      break
    }
  }
  
  if (latestColumns.length < 3) {
    throw new Error('Invalid CSV format: no valid data lines found')
  }
  
  const date = latestColumns[0]
  const time = latestColumns[1]
  const timestamp = parseCSVDateTime(date, time)
  
  const result: WBGTData[] = []
  
  // 各地点のデータを処理
  locationCodes.forEach((locationCode, index) => {
    const wbgtValue = parseFloat(latestColumns[index + 2])
    
    if (!isNaN(wbgtValue) && locationCode.trim()) {
      // 地点情報を取得（complete-locationsから）
      const locationInfo = getLocationInfoFromDatabase(locationCode.trim())
      
      if (locationInfo) {
        result.push({
          locationCode: locationCode.trim(),
          locationName: locationInfo.name,
          prefecture: locationInfo.prefecture,
          wbgt: wbgtValue,
          temperature: estimateTemperatureFromWBGT(wbgtValue), // WBGTから気温を推定
          humidity: 65, // デフォルト湿度（実際のデータが利用可能になったら更新）
          timestamp: timestamp,
          forecast: generateForecastFromHistoricalData(lines, locationCode.trim(), index + 2)
        })
      }
    }
  })
  
  return result
}

/**
 * CSV日時をISO文字列に変換
 */
function parseCSVDateTime(date: string, time: string): string {
  try {
    // 日付形式: "2025/6/1", 時刻形式: "1:00"
    const [year, month, day] = date.split('/')
    const [hour, minute = '0'] = time.split(':')
    
    const dateObj = new Date(
      parseInt(year),
      parseInt(month) - 1, // 月は0ベース
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    )
    
    return dateObj.toISOString()
  } catch (error) {
    console.error('Error parsing CSV datetime:', error)
    return new Date().toISOString()
  }
}

/**
 * WBGTから気温を推定（簡易的な計算）
 */
function estimateTemperatureFromWBGT(wbgt: number): number {
  // WBGT ≈ 0.7 × 湿球温度 + 0.2 × 黒球温度 + 0.1 × 乾球温度
  // 簡易的にWBGT + 5°C程度として推定
  return Math.round((wbgt + 5) * 10) / 10
}

/**
 * 履歴データから予報を生成
 */
function generateForecastFromHistoricalData(lines: string[], locationCode: string, columnIndex: number): WBGTForecast[] {
  const forecasts: WBGTForecast[] = []
  
  // 直近24時間のデータから予報を生成
  const recentLines = lines.slice(-24).slice(1) // ヘッダーを除いた直近24行
  
  recentLines.forEach((line, index) => {
    const columns = line.split(',')
    const wbgt = parseFloat(columns[columnIndex])
    
    if (!isNaN(wbgt)) {
      const date = columns[0]
      const time = columns[1]
      const level = getWBGTLevel(wbgt)
      
      forecasts.push({
        date: formatDate(date),
        time: formatTime(time),
        wbgt: wbgt,
        level: level.level,
        label: level.label,
        guidance: level.guidance
      })
    }
  })
  
  return forecasts.slice(0, 21) // 21点に制限
}

/**
 * 日付フォーマット
 */
function formatDate(csvDate: string): string {
  try {
    const [year, month, day] = csvDate.split('/')
    return `${month}月${day}日`
  } catch {
    return csvDate
  }
}

/**
 * 時刻フォーマット
 */
function formatTime(csvTime: string): string {
  try {
    const [hour] = csvTime.split(':')
    return `${hour}時`
  } catch {
    return csvTime
  }
}

/**
 * 暑さ指数レベルを判定
 */
export function getWBGTLevel(wbgt: number): { level: number; label: string; guidance: string } {
  if (wbgt >= 31) {
    return { level: 4, label: '危険', guidance: '運動は原則中止' }
  } else if (wbgt >= 28) {
    return { level: 3, label: '厳重警戒', guidance: '激しい運動は中止' }
  } else if (wbgt >= 25) {
    return { level: 2, label: '警戒', guidance: '積極的に休息' }
  } else if (wbgt >= 21) {
    return { level: 1, label: '注意', guidance: '積極的に水分補給' }
  } else {
    return { level: 0, label: '安全', guidance: '適宜水分補給' }
  }
}

/**
 * 仮の予報データ生成（実際のAPIに応じて実装）
 */
function generateMockForecast(): WBGTForecast[] {
  const forecasts: WBGTForecast[] = []
  const now = new Date()
  
  // 3日間、3時間間隔で21点の予報データ
  for (let day = 0; day < 3; day++) {
    for (let hour = 0; hour < 24; hour += 3) {
      const forecastDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000)
      const mockWBGT = Math.floor(Math.random() * 15) + 20 // 20-35の範囲
      const level = getWBGTLevel(mockWBGT)
      
      forecasts.push({
        date: forecastDate.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) + '日',
        time: hour + '時',
        wbgt: mockWBGT,
        level: level.level,
        label: level.label,
        guidance: level.guidance
      })
    }
  }
  
  return forecasts.slice(0, 21) // 21点に制限
}

/**
 * 地点コードから地点情報を取得（complete-locationsから）
 */
function getLocationInfoFromDatabase(locationCode: string): { name: string; prefecture: string } | null {
  const allLocations = getAllCompleteLocations()
  const location = allLocations.find(loc => loc.code === locationCode)
  return location ? { name: location.name, prefecture: location.prefecture } : null
}

/**
 * 地点コードから地点情報を取得（後方互換性のため）
 */
export function getLocationInfo(locationCode: string): { name: string; prefecture: string } | null {
  return getLocationInfoFromDatabase(locationCode)
}

/**
 * データの整合性チェック
 */
export function validateWBGTData(data: WBGTData[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!Array.isArray(data)) {
    errors.push('Data is not an array')
    return { valid: false, errors }
  }
  
  data.forEach((item, index) => {
    if (!item.locationCode) {
      errors.push(`Item ${index}: Missing locationCode`)
    }
    if (typeof item.wbgt !== 'number' || isNaN(item.wbgt)) {
      errors.push(`Item ${index}: Invalid WBGT value`)
    }
    if (typeof item.temperature !== 'number' || isNaN(item.temperature)) {
      errors.push(`Item ${index}: Invalid temperature value`)
    }
  })
  
  return { valid: errors.length === 0, errors }
}