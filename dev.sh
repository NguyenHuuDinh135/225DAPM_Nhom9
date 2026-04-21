#!/bin/bash
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Chạy .NET Aspire AppHost (BE + Postgres + Redis)
echo "[BE] Starting .NET Aspire AppHost..."
cd "$ROOT/backend/src/AppHost"
dotnet run &
BE_PID=$!

# Chạy Frontend (Turbo + Bun)
echo "[FE] Starting Frontend..."
cd "$ROOT/frontend"
bun dev &
FE_PID=$!

echo ""
echo "BE PID: $BE_PID | FE PID: $FE_PID"
echo "Press Ctrl+C to stop both."

trap "kill $BE_PID $FE_PID 2>/dev/null; exit 0" INT TERM
wait
