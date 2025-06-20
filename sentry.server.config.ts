/**
 * Sentry configuration for server-side error tracking
 */

import * as Sentry from "@sentry/nextjs"

// Only initialize in production
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Server-specific configuration
    ignoreErrors: [
      // Common server errors to ignore
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
    ],
    
    // Additional context
    beforeSend(event) {
      // Add server context
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers['authorization']
          delete event.request.headers['cookie']
        }
      }
      
      return event
    },
  })
}