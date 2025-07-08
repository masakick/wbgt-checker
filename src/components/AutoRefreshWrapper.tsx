"use client"

import { useAutoRefresh } from '@/hooks/useAutoRefresh'

interface AutoRefreshWrapperProps {
  lastUpdated: string
  children: React.ReactNode
}

export function AutoRefreshWrapper({ lastUpdated, children }: AutoRefreshWrapperProps) {
  // 60分以上古いデータは自動更新（頻繁な更新を防ぐため）
  useAutoRefresh({
    lastUpdated,
    refreshThresholdMinutes: 60
  })

  return <>{children}</>
}