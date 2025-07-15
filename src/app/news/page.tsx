import { Metadata } from 'next'
import { NavigationHeader } from '@/components/NavigationHeader'
import { getNewsItems } from '@/lib/news-data'
import { Calendar, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: '運営からのお知らせ - 暑さ指数チェッカー',
  description: 'atsusa.jpの最新情報やお知らせをご確認いただけます。',
  openGraph: {
    title: '運営からのお知らせ - 暑さ指数チェッカー',
    description: 'atsusa.jpの最新情報やお知らせをご確認いただけます。',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/news`,
    type: 'website',
  }
}

export default function NewsPage() {
  const newsItems = getNewsItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <NavigationHeader />

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ページタイトル */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            運営からのお知らせ
          </h1>
          <p className="text-gray-600">
            atsusa.jpの最新情報やメンテナンス情報をお知らせします。
          </p>
        </div>

        {/* お知らせ一覧 */}
        <div className="space-y-6">
          {newsItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">現在お知らせはありません。</p>
            </div>
          ) : (
            newsItems.map((news) => (
              <article 
                key={news.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* ヘッダー */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={news.date}>
                        {news.date}
                      </time>
                      {news.isImportant && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          重要
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {news.title}
                  </h2>
                </div>

                {/* 本文 */}
                <div className="px-6 pb-6">
                  <div className="prose prose-gray max-w-none">
                    {news.content.split('\n').map((paragraph, index) => {
                      if (paragraph.trim() === '') return null
                      
                      // 箇条書きの処理
                      if (paragraph.startsWith('•')) {
                        const content = paragraph.substring(1).trim()
                        // **で囲まれた見出しをh3として処理
                        if (content.includes('**')) {
                          const cleanContent = content.replace(/\*\*/g, '')
                          return (
                            <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-2">
                              {cleanContent}
                            </h3>
                          )
                        }
                        // 通常の箇条書き
                        return (
                          <div key={index} className="ml-4 mb-2">
                            <div className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span className="text-gray-700 leading-relaxed">
                                {content}
                              </span>
                            </div>
                          </div>
                        )
                      }
                      
                      // 見出しの処理（**で囲まれた部分）
                      if (paragraph.includes('**')) {
                        const parts = paragraph.split('**')
                        return (
                          <p key={index} className="text-gray-700 leading-relaxed mb-3">
                            {parts.map((part, partIndex) => (
                              partIndex % 2 === 1 ? (
                                <strong key={partIndex} className="font-semibold text-gray-900">
                                  {part}
                                </strong>
                              ) : (
                                <span key={partIndex}>{part}</span>
                              )
                            ))}
                          </p>
                        )
                      }
                      
                      // 通常の段落
                      return (
                        <p key={index} className="text-gray-700 leading-relaxed mb-3">
                          {paragraph}
                        </p>
                      )
                    })}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">お問い合わせについて</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              ご不明な点やご要望がございましたら、ヘッダーメニューの「お問い合わせ」よりお気軽にご連絡ください。
              <br />
              いただいたご意見は、サービス向上の参考とさせていただきます。
            </p>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">
            <a href="/about" className="hover:text-blue-400">利用規約</a>
            <span className="mx-2">｜</span>
            <a href="/news" className="hover:text-blue-400">お知らせ</a>
            <span className="mx-2">｜</span>
            データ提供：
            <a href="https://www.wbgt.env.go.jp/sp/" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">環境省</a>
            ,
            <a href="https://www.jma.go.jp/jma/index.html" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">気象庁</a>
            <br />
            開発：一橋大学大学院ソーシャル・データサイエンス研究科　
            <a href="https://x.com/masakick" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">山辺真幸</a>
          </p>
        </div>
      </footer>
    </div>
  )
}