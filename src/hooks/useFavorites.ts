/**
 * お気に入り地点管理カスタムフック
 */

import { useState, useEffect } from 'react'

export interface FavoriteLocation {
  code: string
  name: string
  prefecture: string
  addedAt: string
}

const FAVORITES_KEY = 'wbgt-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ローカルストレージから読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setFavorites(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
      setFavorites([])
    }
    setIsLoading(false)
  }, [])

  // ローカルストレージに保存
  const saveFavorites = (newFavorites: FavoriteLocation[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
      setFavorites(newFavorites)
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }

  // お気に入りに追加
  const addFavorite = (code: string, name: string, prefecture: string) => {
    const newFavorite: FavoriteLocation = {
      code,
      name,
      prefecture,
      addedAt: new Date().toISOString()
    }
    
    const updated = [...favorites.filter(fav => fav.code !== code), newFavorite]
    saveFavorites(updated)
  }

  // お気に入りから削除
  const removeFavorite = (code: string) => {
    const updated = favorites.filter(fav => fav.code !== code)
    saveFavorites(updated)
  }

  // お気に入りかどうかチェック
  const isFavorite = (code: string) => {
    return favorites.some(fav => fav.code === code)
  }

  // お気に入り切り替え
  const toggleFavorite = (code: string, name: string, prefecture: string) => {
    if (isFavorite(code)) {
      removeFavorite(code)
    } else {
      addFavorite(code, name, prefecture)
    }
  }

  // お気に入りを最新順でソート
  const sortedFavorites = [...favorites].sort((a, b) => 
    new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  )

  return {
    favorites: sortedFavorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    count: favorites.length
  }
}