"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin } from 'lucide-react'
import Link from 'next/link'
import { getAllCompleteLocations } from '@/lib/complete-locations'

interface SearchResult {
  code: string
  name: string
  prefecture: string
}

interface SearchBarProps {
  isInModal?: boolean
}

export function SearchBar({ isInModal = false }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // 検索実行
  useEffect(() => {
    if (query.length < 1) {
      setResults([])
      setIsOpen(false)
      return
    }

    const allLocations = getAllCompleteLocations()
    const filtered = allLocations
      .filter(location => 
        location.name.includes(query) || 
        location.prefecture.includes(query)
      )
      .slice(0, 8) // 最大8件表示
      .map(location => ({
        code: location.code,
        name: location.name,
        prefecture: location.prefecture
      }))

    setResults(filtered)
    setIsOpen(filtered.length > 0)
    setSelectedIndex(-1)
  }, [query])

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          window.location.href = `/wbgt/${results[selectedIndex].code}`
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // 外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="地名で検索（例：東京、大阪）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(results.length > 0)}
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        />
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
      </div>

      {/* 検索結果 */}
      {isOpen && (
        <div 
          ref={resultsRef}
          className={isInModal 
            ? "fixed left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
            : "absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          }
          style={isInModal 
            ? { 
                zIndex: 99999,
                top: '220px',
                maxWidth: 'calc(100vw - 32px)'
              }
            : { zIndex: 9999 }
          }
        >
          {results.map((result, index) => (
            <Link
              key={result.code}
              href={`/wbgt/${result.code}`}
              className={`
                block px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0
                ${index === selectedIndex ? 'bg-blue-50' : ''}
              `}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">{result.name}</div>
                  <div className="text-sm text-gray-600">{result.prefecture}</div>
                </div>
              </div>
            </Link>
          ))}
          
          {query && results.length === 0 && (
            <div className="px-4 py-3 text-gray-500 text-center">
              「{query}」に一致する地点が見つかりません
            </div>
          )}
        </div>
      )}
    </div>
  )
}