import Link from 'next/link'
import { Thermometer } from 'lucide-react'

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
        <Thermometer className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-lg font-bold text-gray-900">暑さ指数チェッカー</div>
        <div className="text-xs text-gray-600 -mt-1">WBGT Monitor</div>
      </div>
    </Link>
  )
}