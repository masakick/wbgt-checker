"use client"

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useToast, Toast as ToastType } from '@/contexts/ToastContext'

interface ToastProps {
  toast: ToastType
}

function ToastItem({ toast }: ToastProps) {
  const { removeToast } = useToast()

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className={`
      flex items-center gap-3 p-4 rounded-lg border shadow-lg
      transform transition-all duration-300 ease-in-out
      animate-slide-up
      ${getBackgroundColor()}
    `}>
      {getIcon()}
      <p className="flex-1 text-sm font-medium text-gray-900">
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="閉じる"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      <div className="flex flex-col gap-2 min-w-80 max-w-md">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  )
}