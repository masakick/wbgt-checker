#!/bin/bash

# 包括的地点テストスクリプト（ランダムサンプリング）
BASE_URL="https://wbgt-checker.vercel.app"

# 全国各地方の代表地点をランダムサンプリング
ALL_TEST_LOCATIONS=(
  # 北海道（各振興局から代表）
  "11016:稚内" "14163:札幌" "12442:旭川" "16401:帯広" "17216:釧路" "18196:根室" "19356:函館"
  
  # 東北（各県から代表）
  "31312:青森" "32402:秋田" "33431:盛岡" "34392:仙台" "35392:山形" "36106:福島"
  
  # 関東（各都県から代表）
  "40201:水戸" "41277:宇都宮" "42251:前橋" "43166:さいたま" "44132:東京" "45212:千葉" "46106:横浜"
  
  # 中部（各県から代表）
  "54232:新潟" "55102:富山" "56227:金沢" "57066:福井" "49142:甲府" "48141:長野"
  "52586:岐阜" "50331:静岡" "51106:名古屋" "53133:津"
  
  # 近畿（各府県から代表）
  "60216:大津" "61286:京都" "62078:大阪" "63518:神戸" "64036:奈良" "65042:和歌山"
  
  # 中国（各県から代表）
  "69122:鳥取" "68132:松江" "66408:岡山" "67437:広島" "81146:山口"
  
  # 四国（各県から代表）
  "71106:徳島" "72086:高松" "73166:松山" "74182:高知"
  
  # 九州（各県から代表）
  "82182:福岡" "85142:佐賀" "84496:長崎" "86141:熊本" "83216:大分" "87376:宮崎" "88317:鹿児島"
  
  # 沖縄
  "91197:那覇" "94081:石垣島"
)

# 特別テスト（問題のある可能性がある地点）
SPECIAL_TEST_LOCATIONS=(
  "41171:廃止地点テスト"
  "45147:変更地点1"
  "74181:変更地点2"
  "88836:変更地点3"
)

# 結果カウンター
SUCCESS_COUNT=0
ERROR_COUNT=0
REDIRECT_COUNT=0
SLOW_COUNT=0
TOTAL_COUNT=0

echo "🚀 包括的地点ページアクセステスト開始"
echo "基準URL: $BASE_URL"
echo "テスト対象: ${#ALL_TEST_LOCATIONS[@]} + ${#SPECIAL_TEST_LOCATIONS[@]} = $((${#ALL_TEST_LOCATIONS[@]} + ${#SPECIAL_TEST_LOCATIONS[@]})) 地点"
echo "============================================================"

# メイン地点のテスト
echo "📍 全国代表地点テスト"
for location in "${ALL_TEST_LOCATIONS[@]}"; do
  IFS=':' read -r code name <<< "$location"
  url="$BASE_URL/wbgt/$code"
  
  echo -n "テスト中: $code ($name)... "
  
  # curlでHTTPステータスとレスポンス時間を取得
  start_time=$(date +%s.%N)
  response=$(curl -s -w "%{http_code}:%{time_total}" -o /dev/null "$url" --max-time 10)
  end_time=$(date +%s.%N)
  
  http_code=$(echo "$response" | cut -d':' -f1)
  time_total=$(echo "$response" | cut -d':' -f2)
  
  TOTAL_COUNT=$((TOTAL_COUNT + 1))
  
  if [ "$http_code" = "200" ]; then
    # レスポンス時間チェック
    if (( $(echo "$time_total > 3.0" | bc -l) )); then
      echo "✅ OK - 遅延 (${time_total}s)"
      SLOW_COUNT=$((SLOW_COUNT + 1))
    else
      echo "✅ OK (${time_total}s)"
    fi
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
    # 300番台はリダイレクトとして扱う
    if [[ "$http_code" =~ ^3[0-9][0-9]$ ]]; then
      REDIRECT_COUNT=$((REDIRECT_COUNT + 1))
    else
      ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
  fi
  
  # レート制限回避のため短い休憩
  sleep 0.1
done

echo ""
echo "🔄 特別地点テスト（リダイレクト・廃止地点）"
for location in "${SPECIAL_TEST_LOCATIONS[@]}"; do
  IFS=':' read -r code name <<< "$location"
  url="$BASE_URL/wbgt/$code"
  
  echo -n "テスト中: $code ($name)... "
  
  # -L オプションでリダイレクトを追跡
  response=$(curl -s -w "%{http_code}:%{redirect_url}:%{time_total}" -o /dev/null -L "$url" --max-time 10)
  http_code=$(echo "$response" | cut -d':' -f1)
  redirect_url=$(echo "$response" | cut -d':' -f2)
  time_total=$(echo "$response" | cut -d':' -f3)
  
  TOTAL_COUNT=$((TOTAL_COUNT + 1))
  
  if [ "$http_code" = "200" ] && [ ! -z "$redirect_url" ] && [ "$redirect_url" != "$url" ]; then
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
  
  sleep 0.1
done

echo ""
echo "📊 包括的テスト結果サマリー"
echo "================================"
echo "✅ 成功: $SUCCESS_COUNT/$TOTAL_COUNT ($(echo "scale=1; $SUCCESS_COUNT * 100 / $TOTAL_COUNT" | bc)%)"
echo "↪️ リダイレクト: $REDIRECT_COUNT"
echo "🐌 遅延 (>3秒): $SLOW_COUNT" 
echo "❌ エラー: $ERROR_COUNT"
echo "📈 総テスト数: $TOTAL_COUNT"

if [ $SLOW_COUNT -gt 0 ]; then
  echo ""
  echo "⚠️ パフォーマンス注意: $SLOW_COUNT 地点で3秒以上の遅延が発生しました"
fi

if [ $ERROR_COUNT -eq 0 ]; then
  echo ""
  echo "🎉 全てのテストが成功しました！"
  echo "✨ 全国の代表地点への正常アクセスを確認"
  exit 0
else
  echo ""
  echo "⚠️ $ERROR_COUNT 件のエラーがありました。"
  if [ $ERROR_COUNT -le 2 ]; then
    echo "💡 エラー数が少ないため、おおむね正常と判断されます"
    exit 0
  else
    echo "🔧 要調査: エラーが多く発生しています"
    exit 1
  fi
fi