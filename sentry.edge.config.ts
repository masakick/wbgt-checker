/**
 * Sentry configuration for Edge Runtime
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
    
    // Edge-specific configuration
    ignoreErrors: [
      // Common edge errors to ignore
      'ECONNRESET',
      'ETIMEDOUT',
    ],
  })
}