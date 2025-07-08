'use client'

import { useEffect } from 'react'
import { useLoading } from '@/contexts/LoadingContext'

export function LoadingManager() {
  const { setIsLoading } = useLoading()

  useEffect(() => {
    // コンポーネントがマウントされたらローディングを解除
    setIsLoading(false)
  }, [setIsLoading])

  return null
}