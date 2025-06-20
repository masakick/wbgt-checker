/**
 * Robots.txt configuration
 */

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/full-mockup',
          '/mockup',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}