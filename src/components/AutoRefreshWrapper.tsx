"use client"

import { useAutoRefresh } from '@/hooks/useAutoRefresh'

interface AutoRefreshWrapperProps {
  lastUpdated: string
  children: React.ReactNode
}

export function AutoRefreshWrapper({ lastUpdated, children }: AutoRefreshWrapperProps) {
  // 30分以上古いデータは自動更新
  useAutoRefresh({
    lastUpdated,
    refreshThresholdMinutes: 30
  })

  return <>{children}</>
}