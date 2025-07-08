#!/bin/bash

# リダイレクト機能の詳細テストスクリプト
BASE_URL="https://wbgt-checker.vercel.app"

echo "🔄 リダイレクト機能の詳細テスト"
echo "==============================================="

# 廃止地点テスト（トップページへリダイレクト）
echo "📍 廃止地点テスト（41171: 今市）"
echo "期待動作: / へリダイレクト"
echo "-------------------------------------------"

response=$(curl -s -w "HTTPSTATUS:%{http_code}:REDIRECT:%{redirect_url}:FINAL:%{url_effective}" \
  -o /dev/null \
  "$BASE_URL/wbgt/41171")

http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d':' -f2)
redirect_url=$(echo "$response" | grep -o "REDIRECT:[^:]*" | cut -d':' -f2)
final_url=$(echo "$response" | grep -o "FINAL:.*" | cut -d':' -f2-)

echo "HTTP状態: $http_code"
echo "リダイレクトURL: $redirect_url"
echo "最終URL: $final_url"

if [[ "$final_url" == "$BASE_URL/" ]] || [[ "$final_url" == "$BASE_URL" ]]; then
  echo "✅ 廃止地点リダイレクト: 正常"
else
  echo "❌ 廃止地点リダイレクト: 期待と異なる"
fi

echo ""

# 変更地点テスト
declare -A CHANGED_LOCATIONS=(
  ["45147"]="45148:銚子"
  ["74181"]="74182:高知" 
  ["88836"]="88837:名瀬"
)

echo "📍 変更地点テスト"
echo "-------------------------------------------"

for old_code in "${!CHANGED_LOCATIONS[@]}"; do
  IFS=':' read -r new_code name <<< "${CHANGED_LOCATIONS[$old_code]}"
  
  echo "テスト: $old_code → $new_code ($name)"
  
  response=$(curl -s -w "HTTPSTATUS:%{http_code}:REDIRECT:%{redirect_url}:FINAL:%{url_effective}" \
    -o /dev/null \
    "$BASE_URL/wbgt/$old_code")
  
  http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d':' -f2)
  redirect_url=$(echo "$response" | grep -o "REDIRECT:[^:]*" | cut -d':' -f2)
  final_url=$(echo "$response" | grep -o "FINAL:.*" | cut -d':' -f2-)
  
  echo "  HTTP状態: $http_code"
  echo "  最終URL: $final_url"
  
  expected_url="$BASE_URL/wbgt/$new_code"
  if [[ "$final_url" == "$expected_url" ]]; then
    echo "  ✅ リダイレクト: 正常 ($old_code → $new_code)"
  else
    echo "  ❌ リダイレクト: 期待と異なる"
    echo "     期待: $expected_url"
    echo "     実際: $final_url"
  fi
  echo ""
done

echo "🧪 追加テスト: 正常地点（リダイレクトなし）"
echo "-------------------------------------------"

normal_code="44132"
echo "テスト: $normal_code (東京) - リダイレクトなしの確認"

response=$(curl -s -w "HTTPSTATUS:%{http_code}:REDIRECT:%{redirect_url}:FINAL:%{url_effective}" \
  -o /dev/null \
  "$BASE_URL/wbgt/$normal_code")

http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d':' -f2)
final_url=$(echo "$response" | grep -o "FINAL:.*" | cut -d':' -f2-)

echo "HTTP状態: $http_code"
echo "最終URL: $final_url"

expected_url="$BASE_URL/wbgt/$normal_code"
if [[ "$final_url" == "$expected_url" ]]; then
  echo "✅ 正常地点: リダイレクトなし（期待通り）"
else
  echo "❌ 正常地点: 予期しないリダイレクト"
fi

echo ""
echo "🎯 リダイレクトテスト完了"