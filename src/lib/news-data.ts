export interface NewsItem {
  id: string
  date: string
  title: string
  content: string
  isImportant?: boolean
}

export const newsData: NewsItem[] = [
  {
    id: '2025-07-15-renewal',
    date: '2025年7月15日',
    title: 'リニューアルのお知らせ',
    content: `いつもご利用ありがとうございます。atsusa.jpはより見やすいデザインと使い勝手の向上のためリニューアルしました。

主な変更点：

• **モバイル対応の強化**
  スマートフォンでも見やすく操作しやすいデザインに刷新しました。

• **検索機能の追加**
  全国840地点から地点名で素早く検索できるようになりました。

• **お気に入り機能**
  よく確認する地点をお気に入りに登録して、すぐにアクセスできます。

• **詳細な予報情報**
  3日間・21時点の詳細な暑さ指数予報を表形式で表示します。

• **PWA対応**
  ホーム画面に追加してアプリのように使用できます。

• **運動指針と活動場所ガイド**
  暑さ指数に応じた運動時の対処法と、8つの活動場所別のガイドラインを表示します。

今後ともよろしくお願いいたします。

お気づきの点がございましたら、メニューの「お問い合わせ」よりご連絡ください。運営者は1人で運営しているため、返信にお時間をいただく場合がありますが、必ず目を通します。`,
    isImportant: true
  }
]

export function getNewsItems(): NewsItem[] {
  return newsData.sort((a, b) => {
    // 日付の降順（新しいものが上）
    const dateA = new Date(a.date.replace('年', '/').replace('月', '/').replace('日', ''))
    const dateB = new Date(b.date.replace('年', '/').replace('月', '/').replace('日', ''))
    return dateB.getTime() - dateA.getTime()
  })
}

export function getNewsItem(id: string): NewsItem | undefined {
  return newsData.find(item => item.id === id)
}