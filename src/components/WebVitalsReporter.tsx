"use client"

import { useEffect } from 'react'

export function WebVitalsReporter() {
  useEffect(() => {
    // Simple performance monitoring without external dependencies
    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        // Measure First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint')
        paintEntries.forEach(entry => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`${entry.name}: ${entry.startTime}ms`)
          }
        })
        
        // Measure Largest Contentful Paint
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries()
              const lastEntry = entries[entries.length - 1]
              if (lastEntry && process.env.NODE_ENV === 'development') {
                console.log(`LCP: ${lastEntry.startTime}ms`)
              }
            })
            observer.observe({ entryTypes: ['largest-contentful-paint'] })
          } catch (e) {
            // Ignore if not supported
          }
        }
        
        // Simple timing measurement
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
            if (navigation && process.env.NODE_ENV === 'development') {
              console.log('Page Load Performance:', {
                'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
                'TCP Connection': navigation.connectEnd - navigation.connectStart,
                'Request': navigation.responseStart - navigation.requestStart,
                'Response': navigation.responseEnd - navigation.responseStart,
                'DOM Processing': navigation.domComplete - navigation.responseEnd,
                'Total Load Time': navigation.loadEventEnd - navigation.fetchStart
              })
            }
          }, 0)
        })
      }
    }
    
    measurePerformance()
  }, [])
  
  return null // This component doesn't render anything
}