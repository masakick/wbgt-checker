/**
 * 地点コードのリダイレクト設定
 * 環境省のデータベース変更に対応
 */

export const LOCATION_REDIRECTS = {
  // 廃止された地点（トップページへリダイレクト）
  deprecated: ['41171'], // 今市
  
  // コード変更された地点（新コードへリダイレクト）
  changed: {
    '45147': '45148', // 銚子
    '74181': '74182', // 高知
    '88836': '88837', // 名瀬
  } as const
}

/**
 * リダイレクトが必要かチェックし、リダイレクト先を返す
 */
export function getRedirectPath(locationCode: string): string | null {
  // 廃止地点の場合はトップページへ
  if (LOCATION_REDIRECTS.deprecated.includes(locationCode)) {
    return '/'
  }
  
  // 変更地点の場合は新コードへ
  const newCode = LOCATION_REDIRECTS.changed[locationCode as keyof typeof LOCATION_REDIRECTS.changed]
  if (newCode) {
    return `/wbgt/${newCode}`
  }
  
  return null
}