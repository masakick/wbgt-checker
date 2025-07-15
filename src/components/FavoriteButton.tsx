"use client"

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useToast } from '@/contexts/ToastContext'

interface FavoriteButtonProps {
  locationCode: string
  locationName: string
  prefecture: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  hideWhenMenuOpen?: boolean
  isMenuOpen?: boolean
}

export function FavoriteButton({ 
  locationCode, 
  locationName, 
  prefecture, 
  className = '',
  size = 'md',
  hideWhenMenuOpen = false,
  isMenuOpen = false
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { addToast } = useToast()
  const [isAnimating, setIsAnimating] = useState(false)
  const favorite = isFavorite(locationCode)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const wasFavorite = favorite
    toggleFavorite(locationCode, locationName, prefecture)
    
    // アニメーション開始
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)
    
    // トースト通知
    if (wasFavorite) {
      addToast(`${locationName}をお気に入りから削除しました`, 'info')
    } else {
      addToast(`${locationName}をお気に入りに追加しました`, 'success')
    }
  }

  // メニューが開いている時は非表示にする
  if (hideWhenMenuOpen && isMenuOpen) {
    return null
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
        ${isAnimating 
          ? favorite 
            ? 'animate-bounce-heart' 
            : 'animate-shake'
          : ''
        }
        ${className}
      `}
      title={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
      aria-label={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <Heart 
        className={`${sizeClasses[size]} ${favorite ? 'fill-current' : ''} transition-all duration-200`}
      />
    </button>
  )
}