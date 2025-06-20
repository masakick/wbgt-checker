"use client"

import Link from 'next/link'
import { Heart, MapPin, Trash2 } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'

export function FavoritesList() {
  const { favorites, removeFavorite, isLoading } = useFavorites()

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          お気に入りがありません
        </h3>
        <p className="text-gray-500 text-sm">
          地点詳細ページでハートマークをタップして<br />
          お気に入りに追加しましょう
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-500 fill-current" />
        お気に入り地点
        <span className="text-sm font-normal text-gray-500">
          ({favorites.length}件)
        </span>
      </h2>
      
      <div className="space-y-3">
        {favorites.map((favorite) => (
          <div
            key={favorite.code}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
          >
            <Link
              href={`/wbgt/${favorite.code}`}
              className="flex-1 flex items-center gap-3"
            >
              <MapPin className="w-4 h-4 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {favorite.name}
                </h3>
                <p className="text-sm text-gray-600">{favorite.prefecture}</p>
                <p className="text-xs text-gray-400">
                  追加日: {new Date(favorite.addedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </Link>
            
            <button
              onClick={(e) => {
                e.preventDefault()
                removeFavorite(favorite.code)
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="お気に入りから削除"
              aria-label="お気に入りから削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {favorites.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 お気に入り地点はブラウザに保存されます。削除・リセット時にデータが失われる場合があります。
          </p>
        </div>
      )}
    </div>
  )
}