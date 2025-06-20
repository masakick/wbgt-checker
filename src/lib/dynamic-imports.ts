/**
 * Dynamic imports for bundle size optimization
 */

// QRCode library lazy loading
export const loadQRCode = () => import('qrcode')

// Canvas library lazy loading (for server-side image generation)
export const loadCanvas = () => import('canvas')

// Large data sets lazy loading
export const loadCompleteLocations = () => import('./complete-locations')