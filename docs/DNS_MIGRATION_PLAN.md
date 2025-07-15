# DNS移行計画

## 現在の構成（2025年7月15日）
- **ドメイン管理**: バリュードメイン
- **DNS**: さくらインターネット (ns1.dns.ne.jp, ns2.dns.ne.jp)
- **現行サイト**: さくらインターネットホスティング (163.43.87.236)
- **フォールバックURL**: https://masaki-yamabe.sakura.ne.jp/atsusa/

## Vercel DNS設定情報
### atsusa.jp（メインドメイン）
```
Type: A
Name: @
Value: 216.198.79.1
```

### www.atsusa.jp（サブドメイン）
```
Type: CNAME  
Name: www
Value: bd881ef5e00ebb56.vercel-dns-017.com
```

## 夜間作業計画（深夜2-5時推奨）

### 事前準備（1日前）
1. **TTL短縮**: 現在のさくらDNSで300秒に設定
2. **バリュードメインDNS設定準備**: 新レコードを事前に準備

### DNS移行手順
1. **ネームサーバー変更**（バリュードメイン管理画面）:
   ```
   変更前: ns1.dns.ne.jp, ns2.dns.ne.jp
   変更後: ns1.value-domain.com, ns2.value-domain.com
   ```

2. **バリュードメインDNS設定**:
   ```
   A    @    216.198.79.1
   CNAME www  bd881ef5e00ebb56.vercel-dns-017.com
   ```

3. **環境変数更新**（Vercel）:
   ```
   NEXT_PUBLIC_SITE_URL=https://atsusa.jp
   ```

## 移行後の状況
- **新サイト**: https://atsusa.jp (Vercel)
- **旧サイト**: https://masaki-yamabe.sakura.ne.jp/atsusa/ で継続アクセス可能
- **データソース**: 引き続き現行サイトのCronデータを利用
- **SSL**: Vercelが自動的にLet's Encrypt証明書を発行

## 確認事項
### DNS浸透確認
```bash
# Aレコード確認
dig atsusa.jp
# ネームサーバー確認
dig NS atsusa.jp
# SSL証明書確認
openssl s_client -connect atsusa.jp:443 -servername atsusa.jp
```

### 動作確認
1. https://atsusa.jp へのアクセス
2. SSL証明書の有効性
3. 全840地点のページアクセス
4. データ更新の継続性

## ロールバック手順
問題発生時は以下の手順で元に戻す：

1. **ネームサーバーを元に戻す**:
   ```
   ns1.value-domain.com → ns1.dns.ne.jp
   ns2.value-domain.com → ns2.dns.ne.jp
   ```

2. **DNS浸透待機**: 30分～2時間

## 注意事項
- **DNS浸透時間**: ネームサーバー変更は2-24時間（通常4-6時間）
- **部分的な移行期間**: 一部ユーザーは旧サイト、一部は新サイトを見る
- **データ継続性**: 現行サイトのデータAPIは変更なし
- **SSL発行タイミング**: DNS変更後、数分～数時間で自動発行