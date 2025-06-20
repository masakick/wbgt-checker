"use client"

import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'

interface FavoriteButtonProps {
  locationCode: string
  locationName: string
  prefecture: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FavoriteButton({ 
  locationCode, 
  locationName, 
  prefecture, 
  className = '',
  size = 'md' 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(locationCode)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(locationCode, locationName, prefecture)
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center p-2 rounded-full
        transition-all duration-200 hover:scale-110
        ${favorite 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
        }
        ${className}
      `}
      title={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
      aria-label={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <Heart 
        className={`${sizeClasses[size]} ${favorite ? 'fill-current' : ''}`}
      />
    </button>
  )
}