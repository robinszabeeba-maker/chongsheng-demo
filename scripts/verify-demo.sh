#!/bin/bash
# 本地 Demo 全链路冒烟测试（需 API 已在 :8000 运行）
set -e
API="${API_URL:-http://localhost:8000}"

echo "==> Health"
curl -sf "$API/health" | head -c 200
echo ""

echo "==> Login demo user"
TOKEN=$(curl -sf -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@chongsheng.demo","password":"Demo123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo "==> Me / points"
curl -sf "$API/api/me" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20

echo "==> Create API Key"
KEY_RESP=$(curl -sf -X POST "$API/api/keys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"smoke-test"}')
API_KEY=$(echo "$KEY_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['api_key'])")
POINTS_BEFORE=$(curl -sf "$API/api/me" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['points_balance'])")

echo "==> Vision analyze (success)"
curl -sf -X POST "$API/v1/vision/analyze" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"image_url":"https://example.com/pet.jpg","task_type":"breed"}' | head -c 300
echo ""

POINTS_AFTER=$(curl -sf "$API/api/me" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['points_balance'])")
echo "Points: $POINTS_BEFORE -> $POINTS_AFTER (expect -15)"

echo "==> Vision fail (no image)"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$API/v1/vision/analyze" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'

echo "==> All smoke checks done"
