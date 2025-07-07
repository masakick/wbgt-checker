"use client"

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface ScrollGuideProps {
  /** ガイドを表示する閾値（スクロール位置） */
  hideThreshold?: number
}

export function ScrollGuide({ hideThreshold = 100 }: ScrollGuideProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      
      // 閾値を超えてスクロールしたらガイドを非表示
      if (scrollTop > hideThreshold) {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [hideThreshold])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
      {/* z-40: トーストのz-50より低く設定してお気に入りフィードバックが優先される */}
      <div className="
        flex items-center gap-2 px-4 py-2 
        bg-gray-800 text-white text-sm font-medium 
        rounded-full shadow-lg
        animate-bounce
        opacity-80
      ">
        <span>スクロールして予報を見る</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  )
}