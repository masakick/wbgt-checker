"use client"

import { useState, useEffect } from "react"
import { QrCode } from "lucide-react"

interface QRCodeSectionProps {
  pageUrl: string
}

export function QRCodeSection({ pageUrl }: QRCodeSectionProps) {
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
      <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
        <QrCode className="w-6 h-6" />
        このページのQRコード
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
            <div className="text-gray-500">
              <QrCode className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">生成中...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}