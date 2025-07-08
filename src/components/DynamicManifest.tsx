'use client'

import { useEffect } from 'react'

interface DynamicManifestProps {
  locationCode: string
}

export function DynamicManifest({ locationCode }: DynamicManifestProps) {
  useEffect(() => {
    // 既存のmanifestリンクを削除
    const existingManifest = document.querySelector('link[rel="manifest"]')
    if (existingManifest) {
      existingManifest.remove()
    }

    // 新しい動的manifestリンクを追加
    const manifestLink = document.createElement('link')
    manifestLink.rel = 'manifest'
    manifestLink.href = `/api/manifest/${locationCode}`
    document.head.appendChild(manifestLink)

    // クリーンアップ関数
    return () => {
      const dynamicManifest = document.querySelector(`link[href="/api/manifest/${locationCode}"]`)
      if (dynamicManifest) {
        dynamicManifest.remove()
      }
      
      // 元のmanifestを復元
      const originalManifest = document.createElement('link')
      originalManifest.rel = 'manifest'
      originalManifest.href = '/manifest.json'
      document.head.appendChild(originalManifest)
    }
  }, [locationCode])

  return null
}