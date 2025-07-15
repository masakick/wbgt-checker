const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // .html拡張子を除去するリダイレクト
      {
        source: '/wbgt/:code*.html',
        destination: '/wbgt/:code*',
        permanent: true,
      },
      // index.htmlも処理
      {
        source: '/wbgt/:code*/index.html',
        destination: '/wbgt/:code*',
        permanent: true,
      },
      // トップレベルのindex.html
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

// Sentry設定を適用（本番環境のみ）
module.exports = process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN
  ? withSentryConfig(
      nextConfig,
      {
        // Sentry Webpackプラグイン設定
        silent: true, // ビルド時のログを抑制
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
      {
        // ソースマップのアップロード設定
        widenClientFileUpload: true,
        transpileClientSDK: true,
        tunnelRoute: "/monitoring",
        hideSourceMaps: true,
        disableLogger: true,
      }
    )
  : nextConfig