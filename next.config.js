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

module.exports = nextConfig