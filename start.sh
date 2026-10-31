#!/bin/sh
set -e

echo "--> [Startup] กำลังเปิด Service Backend (Python FastAPI) พอร์ต 8001..."
python -m uvicorn main:app --app-dir service/backend --host 127.0.0.1 --port 8001 &

echo "--> [Startup] กำลังเปิด Main Backend (Node.js Express) พอร์ต ${PORT:-8000}..."
export PORT=${PORT:-8000}
export SERVICE_API_TARGET="http://127.0.0.1:8001"

exec npx tsx server/index.ts
