#!/bin/bash
# 本地启动 API（macOS · 无需 Docker）
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/api"

if ! command -v python3 >/dev/null; then
  echo "请先安装 Python 3: https://www.python.org/downloads/"
  exit 1
fi

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

pip install -q --upgrade pip
pip install -q -r requirements.txt
[ -f .env ] || cp .env.example .env

python3 -m app.seed
echo ""
echo "API 启动: http://localhost:8000"
echo "文档:   http://localhost:8000/docs"
echo ""
exec python3 -m uvicorn app.main:app --reload --port 8000
