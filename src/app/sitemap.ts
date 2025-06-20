/**
 * Dynamic sitemap generation for 840 WBGT locations
 */

import { MetadataRoute } from 'next'
import { getAllLocationCodesArray } from '@/lib/complete-locations'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
  const currentDate = new Date()
  
  // Get all 840 location codes
  const locationCodes = getAllLocationCodesArray()
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
  
  // Dynamic location pages (840 locations)
  const locationPages: MetadataRoute.Sitemap = locationCodes.map((code) => ({
    url: `${baseUrl}/wbgt/${code}`,
    lastModified: currentDate,
    changeFrequency: 'hourly', // WBGT data updates hourly
    priority: 0.8,
  }))
  
  // Combine all pages
  return [...staticPages, ...locationPages]
}