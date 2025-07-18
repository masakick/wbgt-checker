"use client"

import { useState, useEffect } from "react"

interface QRCodeSectionProps {
  pageUrl: string
  locationName?: string
  prefecture?: string
}

export function QRCodeSection({ pageUrl, locationName, prefecture }: QRCodeSectionProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Dynamically import qrcode to reduce initial bundle size
        const QRCode = await import("qrcode")
        const qrUrl = await QRCode.default.toDataURL(pageUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrDataUrl(qrUrl)
      } catch (error) {
        console.error('QRコード生成エラー:', error)
      }
    }
    
    if (pageUrl) {
      generateQR()
    }
  }, [pageUrl])

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">
        {locationName && prefecture ? `${locationName}（${prefecture}）のQRコード` : 'このページのQRコード'}
      </h2>
      <p className="text-gray-600 mb-6">情報を周囲の方と共有してください</p>
      
      <div className="flex justify-center">
        <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="QRコード" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-gray-500 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded mb-2 flex items-center justify-center">
                <span className="text-xs">QR</span>
              </div>
              <p className="text-sm">生成中...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}