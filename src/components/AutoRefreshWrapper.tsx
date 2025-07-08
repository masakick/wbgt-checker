"use client"

import { useAutoRefresh } from '@/hooks/useAutoRefresh'

interface AutoRefreshWrapperProps {
  lastUpdated: string
  children: React.ReactNode
}

export function AutoRefreshWrapper({ lastUpdated, children }: AutoRefreshWrapperProps) {
  // 一時的に自動更新を無効化（デバッグのため）
  // useAutoRefresh({
  //   lastUpdated,
  //   refreshThresholdMinutes: 60
  // })

  return <>{children}</>
}