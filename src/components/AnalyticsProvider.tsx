"use client"

import { Analytics } from '@vercel/analytics/react'
import { useEffect } from 'react'

export function AnalyticsProvider() {
  useEffect(() => {
    // Google Analytics initialization (if GA_MEASUREMENT_ID is provided)
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      const script1 = document.createElement('script')
      script1.async = true
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
      document.head.appendChild(script1)

      const script2 = document.createElement('script')
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
          page_path: window.location.pathname,
        });
      `
      document.head.appendChild(script2)
    }
  }, [])

  return (
    <>
      {/* Vercel Analytics - automatically works when deployed to Vercel */}
      <Analytics 
        beforeSend={(event) => {
          // Custom event filtering if needed
          if (event.url.includes('/api/')) {
            // Don't track API routes
            return null
          }
          return event
        }}
      />
    </>
  )
}