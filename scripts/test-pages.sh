#!/bin/bash

# 全841地点のページアクセステストスクリプト（簡易版）
BASE_URL="https://wbgt-checker.vercel.app"

# 主要地点のテスト
MAIN_LOCATIONS=(
  "14163:札幌"
  "34392:仙台" 
  "44132:東京"
  "51106:名古屋"
  "62078:大阪"
  "82182:福岡"
  "91197:那覇"
  "48141:長野"
  "50331:静岡"
  "56227:金沢"
  "67437:広島"
  "73166:松山"
  "86141:熊本"
)

# リダイレクトテスト地点
REDIRECT_LOCATIONS=(
  "41171:廃止地点"
  "45147:変更地点1"
  "74181:変更地点2" 
  "88836:変更地点3"
)

# 結果カウンター
SUCCESS_COUNT=0
ERROR_COUNT=0
REDIRECT_COUNT=0
TOTAL_COUNT=0

echo "🚀 地点ページアクセステスト開始"
echo "基準URL: $BASE_URL"
echo "=================================="

# メイン地点のテスト
echo "📍 主要地点テスト"
for location in "${MAIN_LOCATIONS[@]}"; do
  IFS=':' read -r code name <<< "$location"
  url="$BASE_URL/wbgt/$code"
  
  echo -n "テスト中: $code ($name)... "
  
  # curlでHTTPステータスとレスポンス時間を取得
  response=$(curl -s -w "%{http_code}:%{time_total}" -o /dev/null "$url" --max-time 10)
  http_code=$(echo "$response" | cut -d':' -f1)
  time_total=$(echo "$response" | cut -d':' -f2)
  
  TOTAL_COUNT=$((TOTAL_COUNT + 1))
  
  if [ "$http_code" = "200" ]; then
    echo "✅ OK (${time_total}s)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$http_code" = "404" ]; then
    echo "❌ 404 Not Found"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  elif [ "$http_code" = "500" ]; then
    echo "❌ 500 Server Error"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  elif [ "$http_code" = "000" ]; then
    echo "❌ 接続エラー/タイムアウト"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  else
    echo "⚠️ HTTP $http_code"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  fi
done

echo ""
echo "🔄 リダイレクトテスト"
for location in "${REDIRECT_LOCATIONS[@]}"; do
  IFS=':' read -r code name <<< "$location"
  url="$BASE_URL/wbgt/$code"
  
  echo -n "テスト中: $code ($name)... "
  
  # -L オプションでリダイレクトを追跡
  response=$(curl -s -w "%{http_code}:%{redirect_url}:%{time_total}" -o /dev/null -L "$url" --max-time 10)
  http_code=$(echo "$response" | cut -d':' -f1)
  redirect_url=$(echo "$response" | cut -d':' -f2)
  time_total=$(echo "$response" | cut -d':' -f3)
  
  TOTAL_COUNT=$((TOTAL_COUNT + 1))
  
  if [ "$http_code" = "200" ] && [ ! -z "$redirect_url" ]; then
    echo "↪️ リダイレクト成功 → $redirect_url (${time_total}s)"
    REDIRECT_COUNT=$((REDIRECT_COUNT + 1))
  elif [ "$http_code" = "200" ]; then
    echo "✅ 直接アクセス成功 (${time_total}s)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$http_code" = "404" ]; then
    echo "❌ 404 Not Found"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  elif [ "$http_code" = "000" ]; then
    echo "❌ 接続エラー/タイムアウト"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  else
    echo "⚠️ HTTP $http_code"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  fi
done

echo ""
echo "📊 テスト結果サマリー"
echo "===================="
echo "✅ 成功: $SUCCESS_COUNT"
echo "↪️ リダイレクト: $REDIRECT_COUNT" 
echo "❌ エラー: $ERROR_COUNT"
echo "📈 総数: $TOTAL_COUNT"

if [ $ERROR_COUNT -eq 0 ]; then
  echo ""
  echo "🎉 全てのテストが成功しました！"
  exit 0
else
  echo ""
  echo "⚠️ $ERROR_COUNT 件のエラーがありました。"
  exit 1
fi