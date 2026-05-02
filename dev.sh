#!/bin/bash

# Clean up old processes
echo "Cleaning up old processes..."
pkill -f "dotnet"
pkill -f "next-dev"
pkill -f "turbo"
# docker stop $(docker ps -q --filter name=postgres) $(docker ps -q --filter name=cache) 2>/dev/null || true

# Start Backend (Aspire AppHost) - Only build the AppHost to avoid test project errors
echo "[BE] Starting .NET Aspire AppHost..."
cd backend/src/AppHost
dotnet run --no-launch-profile &
BE_PID=$!

# Wait for API to be ready (health check)
echo "Waiting for API to be ready on port 5000..."
MAX_RETRIES=60
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s http://localhost:5000/health > /dev/null; then
    echo " Backend is UP!"
    break
  fi
  sleep 2
  RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo " Backend timeout, starting FE anyway..."
fi

# Start Frontend
echo "[FE] Starting Frontend..."
cd ../../../frontend
bun turbo dev &
FE_PID=$!

echo ""
echo "BE PID: $BE_PID | FE PID: $FE_PID"
echo "Press Ctrl+C to stop both."

# Wait for both processes
wait $BE_PID $FE_PID
