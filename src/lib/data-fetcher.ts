/**
 * フロントエンド用データ取得ユーティリティ
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { WBGTData, getWBGTLevel } from './data-processor'
// Lazy load large data sets to reduce initial bundle size
const getAllCompleteLocations = async () => {
  const { getAllCompleteLocations: getLocations } = await import('./complete-locations')
  return getLocations()
}

export interface LocationInfo {
  name: string
  prefecture: string
}

/**
 * 地点コードから地点情報を取得（同期版 - フロントエンド用）
 */
export function getLocationInfoSync(locationCode: string): LocationInfo | null {
  // Server-side rendering用の同期版
  try {
    const { getAllCompleteLocations: getLocations } = require('./complete-locations')
    const allLocations = getLocations()
    const location = allLocations.find((loc: any) => loc.code === locationCode)
    return location ? { name: location.name, prefecture: location.prefecture } : null
  } catch {
    return null
  }
}

/**
 * 地点コードから地点情報を取得（非同期版 - サーバーサイド用）
 */
export async function getLocationInfo(locationCode: string): Promise<LocationInfo | null> {
  // 840地点の完全なデータベースから検索
  const allLocations = await getAllCompleteLocations()
  const location = allLocations.find(loc => loc.code === locationCode)
  return location ? { name: location.name, prefecture: location.prefecture } : null
}

/**
 * WBGT データファイルから特定地点のデータを取得
 */
export async function getWBGTData(locationCode: string): Promise<WBGTData | null> {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'wbgt.json')
    const fileContent = await readFile(filePath, 'utf-8')
    const jsonData = JSON.parse(fileContent)
    
    if (!jsonData.data || !Array.isArray(jsonData.data)) {
      console.error('Invalid WBGT data format')
      return null
    }
    
    // 指定された地点コードのデータを検索
    let locationData = jsonData.data.find((item: WBGTData) => 
      item.locationCode === locationCode
    )
    
    // データが見つからない場合、モックデータを生成
    if (!locationData) {
      console.warn(`WBGT data not found for location: ${locationCode}, generating mock data`)
      const locationInfo = await getLocationInfo(locationCode)
      
      if (!locationInfo) {
        console.error(`Location info not found for: ${locationCode}`)
        return null
      }
      
      locationData = generateMockWBGTData(locationCode, locationInfo)
    }
    
    return locationData
  } catch (error) {
    console.error('Error reading WBGT data:', error)
    return null
  }
}

/**
 * モックWBGTデータを生成
 */
function generateMockWBGTData(locationCode: string, locationInfo: LocationInfo): WBGTData {
  // 地域による大まかな気候特性を考慮
  const baseTemp = getBaseTemperatureByRegion(locationInfo.prefecture)
  const wbgt = Math.floor(Math.random() * 15) + baseTemp - 5 // WBGTは気温より5度程度低い
  const temperature = baseTemp + Math.floor(Math.random() * 10) - 5
  const humidity = Math.floor(Math.random() * 30) + 50
  
  const level = getWBGTLevel(wbgt)
  
  return {
    locationCode,
    locationName: locationInfo.name,
    prefecture: locationInfo.prefecture,
    wbgt: Math.max(wbgt, 15), // 最低15度
    temperature: Math.max(temperature, 20), // 最低20度
    humidity: Math.max(Math.min(humidity, 90), 40), // 40-90%
    timestamp: new Date().toISOString(),
    forecast: generateMockForecast(wbgt)
  }
}

/**
 * 都道府県による基準気温を取得
 */
function getBaseTemperatureByRegion(prefecture: string): number {
  if (prefecture.includes('北海道')) return 22
  if (prefecture.includes('青森') || prefecture.includes('秋田') || prefecture.includes('岩手')) return 25
  if (prefecture.includes('沖縄')) return 32
  if (prefecture.includes('鹿児島') || prefecture.includes('宮崎')) return 30
  if (prefecture.includes('福岡') || prefecture.includes('熊本') || prefecture.includes('大分')) return 29
  return 27 // デフォルト
}

/**
 * モック予報データを生成
 */
function generateMockForecast(baseWbgt: number): Array<{
  date: string;
  time: string;
  wbgt: number;
  level: number;
  label: string;
  guidance: string;
}> {
  const forecasts = []
  const now = new Date()
  
  // 21時点の予報データ
  for (let day = 0; day < 3; day++) {
    for (let hour = 0; hour < 24; hour += 3) {
      const forecastDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000)
      const variation = Math.floor(Math.random() * 8) - 4 // ±4度の変動
      const wbgt = Math.max(baseWbgt + variation, 15)
      const level = getWBGTLevel(wbgt)
      
      forecasts.push({
        date: `${forecastDate.getMonth() + 1}月${forecastDate.getDate()}日`,
        time: `${hour}時`,
        wbgt,
        level: level.level,
        label: level.label,
        guidance: level.guidance
      })
    }
  }
  
  return forecasts.slice(0, 21) // 21点に制限
}

/**
 * 全地点のWBGT データを取得
 */
export async function getAllWBGTData(): Promise<WBGTData[]> {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'wbgt.json')
    const fileContent = await readFile(filePath, 'utf-8')
    const jsonData = JSON.parse(fileContent)
    
    if (!jsonData.data || !Array.isArray(jsonData.data)) {
      console.error('Invalid WBGT data format')
      return []
    }
    
    return jsonData.data
  } catch (error) {
    console.error('Error reading WBGT data:', error)
    return []
  }
}

/**
 * 気温データファイルから特定地点のデータを取得
 */
export async function getTemperatureData(locationCode: string) {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'temperature.json')
    const fileContent = await readFile(filePath, 'utf-8')
    const jsonData = JSON.parse(fileContent)
    
    if (!jsonData.data || !Array.isArray(jsonData.data)) {
      console.error('Invalid temperature data format')
      return null
    }
    
    // 指定された地点コードのデータを検索
    const locationData = jsonData.data.find((item: any) => 
      item.locationCode === locationCode
    )
    
    return locationData || null
  } catch (error) {
    console.error('Error reading temperature data:', error)
    return null
  }
}

/**
 * データの最終更新時刻を取得
 */
export async function getDataUpdateTime(): Promise<{ wbgt: string; temperature: string } | null> {
  try {
    const [wbgtFile, tempFile] = await Promise.all([
      readFile(join(process.cwd(), 'public', 'data', 'wbgt.json'), 'utf-8'),
      readFile(join(process.cwd(), 'public', 'data', 'temperature.json'), 'utf-8')
    ])
    
    const wbgtData = JSON.parse(wbgtFile)
    const tempData = JSON.parse(tempFile)
    
    return {
      wbgt: wbgtData.updateTime || 'Unknown',
      temperature: tempData.updateTime || 'Unknown'
    }
  } catch (error) {
    console.error('Error reading update times:', error)
    return null
  }
}

/**
 * 地点検索（名前による部分一致）
 */
export function searchLocations(query: string): { code: string; info: LocationInfo }[] {
  try {
    const { getAllCompleteLocations: getLocations } = require('./complete-locations')
    const allLocations = getLocations()
    const results: { code: string; info: LocationInfo }[] = []
    
    allLocations.forEach((location: any) => {
      if (location.name.includes(query) || location.prefecture.includes(query)) {
        results.push({ 
          code: location.code, 
          info: { name: location.name, prefecture: location.prefecture }
        })
      }
    })
    
    return results.slice(0, 50) // 最大50件に制限
  } catch {
    return []
  }
}