# PWAアイコン変更ガイド

このドキュメントは、暑さ指数チェッカーのPWAインストール時に表示されるアイコンの変更方法について説明します。

## PWAアイコンの仕様

### 必須サイズ
- **192×192px** - PWAの最小要件、インストール時のアイコン表示
- **512×512px** - 高解像度ディスプレイ、スプラッシュスクリーン用

### オプションサイズ（より良い体験のため）
- **144×144px** - Microsoft Storeなど一部プラットフォーム用
- **384×384px** - 中間解像度デバイス用

### ファイル形式と要件
- **推奨形式**: PNG（透過対応）
- **その他対応形式**: WebP、JPEG
- **カラープロファイル**: sRGB推奨
- **ビット深度**: 24ビット（透過ありの場合は32ビット）

## アイコンファイルの場所

現在のアイコンファイルは以下の場所に配置されています：

```
/wbgt-app/public/icons/
├── icon-192x192.png  # メインアイコン（必須）
├── icon-512x512.png  # 高解像度アイコン（必須）
├── icon-16x16.png    # ファビコン用
├── icon-32x32.png    # ファビコン用
├── icon-72x72.png    # レガシーデバイス用
├── icon-96x96.png    # Windows用
├── icon-128x128.png  # Chrome Web Store用
├── icon-144x144.png  # Microsoft用
├── icon-152x152.png  # iOS用
└── icon-384x384.png  # 中間解像度用
```

## 変更手順

### 方法1: 既存ファイルの差し替え（簡単）

1. 新しいアイコン画像を準備
2. 上記のサイズにリサイズ
3. 同じファイル名で `/wbgt-app/public/icons/` に上書き保存
4. ブラウザのキャッシュをクリア
5. 開発サーバーを再起動

### 方法2: 新しいファイル名を使用

1. 新しいアイコンファイルを `/wbgt-app/public/icons/` に配置
2. `/wbgt-app/public/manifest.json` を編集：

```json
{
  "icons": [
    {
      "src": "/icons/新しいファイル名-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/新しいファイル名-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/新しいファイル名-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/新しいファイル名-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## デザインガイドライン

### セーフエリア
- **中央80%**: ロゴやテキストなど重要な要素を配置
- **外側20%**: 装飾的な要素のみ（マスク時に切り取られる可能性）

### 背景の扱い
- **透過背景**: `purpose: "any"` で使用
- **単色背景**: `purpose: "maskable"` で使用（円形マスクなどに対応）

### ブランディング要素
- アプリのテーマカラー（青系 #3b82f6）を活用
- 暑さ指数・熱中症予防を連想させるデザイン
- シンプルで視認性の高いアイコン

## 確認方法

### 開発環境での確認
1. Chrome DevTools → Application タブ
2. Manifest → Icons でアイコンを確認
3. PWAインストールボタンをクリックして表示確認

### キャッシュのクリア
```bash
# 開発サーバーを停止
Ctrl + C

# Next.jsキャッシュをクリア
rm -rf .next

# 開発サーバーを再起動
npm run dev
```

### ブラウザキャッシュのクリア
- Chrome: Ctrl+Shift+R（Windows）/ Cmd+Shift+R（Mac）
- Service Workerの更新: DevTools → Application → Service Workers → Update

## トラブルシューティング

### アイコンが更新されない場合
1. ブラウザのキャッシュを完全にクリア
2. Service Workerを手動で更新
3. manifest.jsonのバージョンを変更（キャッシュバスティング）

### アイコンが表示されない場合
1. ファイルパスが正しいか確認
2. ファイル形式とサイズが仕様に合っているか確認
3. DevToolsのNetworkタブで404エラーがないか確認

## 参考リソース
- [Web App Manifest - MDN](https://developer.mozilla.org/docs/Web/Manifest)
- [Maskable Icons](https://maskable.app/)
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)