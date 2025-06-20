/**
 * Sentry configuration for client-side error tracking
 */

import * as Sentry from "@sentry/nextjs"

// Only initialize in production
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Error filtering
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      
      // Network errors
      'NetworkError',
      'Network request failed',
    ],
    
    // Integration configuration
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Replay configuration
    replaysSessionSampleRate: 0.01, // 1% of sessions
    replaysOnErrorSampleRate: 0.1, // 10% of sessions with errors
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Additional options
    beforeSend(event, hint) {
      // Filter out certain errors
      if (event.exception) {
        const error = hint.originalException
        
        // Ignore specific error messages
        if (error && error instanceof Error) {
          if (error.message?.includes('Script error')) {
            return null
          }
        }
      }
      
      return event
    },
  })
}