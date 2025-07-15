/**
 * 地点詳細ページのローディング画面
 * /wbgt/[locationCode] のページ遷移時に表示
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* ローディング用のナビゲーションヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 地点情報カード */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="animate-pulse">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* WBGTメインビジュアライゼーション */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="animate-pulse">
            <div className="text-center mb-8">
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細予報テーブル */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* テーブルヘッダー */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                {/* テーブル行 */}
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 mb-3">
                    <div className="h-8 bg-gray-100 rounded"></div>
                    <div className="h-8 bg-gray-100 rounded"></div>
                    <div className="h-8 bg-gray-100 rounded"></div>
                    <div className="h-8 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 運動指針セクション */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* 共有・保存ボタン */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </main>

      {/* ローディング表示 */}
      <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">最新データを取得中...</span>
          </div>
        </div>
      </div>
    </div>
  )
}