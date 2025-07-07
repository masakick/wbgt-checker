import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          トップページに戻る
        </Link>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              はじめに<a href="#ula" className="text-blue-600 underline">利用規約</a>をご覧ください。
            </p>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">このサイトについて</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6 leading-relaxed">
              全国841ヵ所の気温と暑さ指数（WBGT値）をほぼリアルタイムに表示します。警戒レベルとその対処についても表示します。また3時間ごとの各地の暑さ指数予測も表示します。シンプルな情報提示で現在の暑さの状況を把握しやすくするデザインを心がけました。
            </p>

            <hr className="my-8" />

            <h2 className="text-xl font-bold text-gray-900 mb-4">使い方について</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              <Link href="/" className="text-blue-600 underline">トップページ</Link>
              でお住まいの地域やお出かけ予定の地域を選択した後、ブックマークするなどしてご利用ください。ページをリロードすると情報が更新されます。下部のQRコードは周囲の方々と共有する際にご利用ください。データの更新は毎時40分頃に行われます。
            </p>

            <hr className="my-8" />

            <h2 className="text-xl font-bold text-gray-900 mb-4">データについて</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              <a 
                href="https://www.wbgt.env.go.jp/" 
                className="text-blue-600 underline hover:text-blue-800"
                target="_blank" 
                rel="noopener noreferrer"
              >
                環境省熱中症予防情報サイト
              </a>
              より提供されるデータを使用しています。環境省のサイトと当サイトでは若干のタイムラグが生じます。
            </p>

            <hr className="my-8" />

            <h2 className="text-xl font-bold text-gray-900 mb-4">運営者について</h2>
            <p className="text-gray-700 mb-6">
              山辺真幸（一橋大学大学院 ソーシャル・データサイエンス研究科特任講師）<br />
              個人サイト：
              <a 
                href="https://masakiyamabe.com" 
                className="text-blue-600 underline hover:text-blue-800"
                target="_blank" 
                rel="noopener noreferrer"
              >
                https://masakiyamabe.com
              </a>
              <br />
              X(旧ツイッター）：
              <a 
                href="https://x.com/masakick" 
                className="text-blue-600 underline hover:text-blue-800"
                target="_blank" 
                rel="noopener noreferrer"
              >
                @masakick
              </a>
            </p>

            <hr className="my-8" />

            <h2 id="ula" className="text-xl font-bold text-gray-900 mb-4">利用規約</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              当サイトのご利用にあたっては、データ提供元である「
              <a 
                href="https://www.wbgt.env.go.jp/data_service.php" 
                className="text-blue-600 underline hover:text-blue-800"
                target="_blank" 
                rel="noopener noreferrer"
              >
                環境省熱中症予防情報サイト
              </a>
              」の利用規約に準じてご同意ください。以下、1~3は同サイトからの引用です。
            </p>

            <ol className="list-decimal list-inside space-y-4 text-gray-700 mb-6 pl-4">
              <li className="leading-relaxed">
                提供する情報については、ネットワークやシステムのトラブルなどにより支障を生じるおそれがあり、環境省及び情報提供事業者では、その内容を保証するものではありません。
              </li>
              <li className="leading-relaxed">
                提供する情報は気象庁の気象予測結果を基に独自の方式で算出したものもあり、その手法には限界があることから、急激な気象要因の変化等により、実際の暑さ指数（WBGT）との間に差が生じる場合があります。
                また、暑さ指数（WBGT）が低い場合でも、周囲の環境、当日の体調、屋外での作業内容などにより、熱中症による事故が起こる場合もあります。
              </li>
              <li className="leading-relaxed">
                情報の利用については、上記二点を理解した上で、利用者自らの責任において行うものとし、情報の利用により生じる混乱、事故等については、その理由に関わらず環境省及び情報提供事業者はその責任を負いません。
              </li>
            </ol>

            <p className="text-gray-700 mb-4 leading-relaxed">
              スクリーンショットなどの転載（ツイート・リツイート）はご自由にしていただいて構いませんが、前述の通り、その結果によって生じるいかなる効果についても一切の関与・保証・賠償等を行いません。
            </p>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <p className="text-blue-800">
                当サイトの閲覧を含むいかなる形態の利用も本規約に同意した上で利用者自身が行ったこととみなします。
                <Link href="/" className="ml-2 text-blue-600 underline hover:text-blue-800">
                  同意して利用する
                </Link>
              </p>
            </div>

            <hr className="my-8" />

            <h2 className="text-xl font-bold text-gray-900 mb-4">更新履歴</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>2025/06/21: Next.js版として全面リニューアル</li>
              <li>2021/07/27: 公開</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'このサイトについて（利用規約）｜暑さ指数チェッカー',
  description: '暑さ指数チェッカーの利用規約とサイト情報'
}