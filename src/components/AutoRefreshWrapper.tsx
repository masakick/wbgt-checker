"use client"

import { usePWARefresh } from '@/hooks/usePWARefresh'
import { usePathname } from 'next/navigation'

interface AutoRefreshWrapperProps {
  lastUpdated: string
  children: React.ReactNode
}

export function AutoRefreshWrapper({ lastUpdated, children }: AutoRefreshWrapperProps) {
  const pathname = usePathname()
  
  // パスから地点コードを取得
  const locationCode = pathname.split('/').pop() || ''
  
  // PWA専用の更新フックを使用（60分以上古いデータを更新）
  usePWARefresh({
    locationCode,
    lastUpdated,
    refreshThresholdMinutes: 60
  })

  return <>{children}</>
}