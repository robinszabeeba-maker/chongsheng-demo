#!/bin/bash
# 本地启动 Web 前端
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/web"

[ -f .env.local ] || cp .env.example .env.local
echo "Web 启动: http://localhost:3000"
exec npm run dev
