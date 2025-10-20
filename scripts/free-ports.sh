#!/usr/bin/env bash
set -euo pipefail
PORTS=("5173" "5174" "5175" "5176" "8080" "8081" "8082" "9099" "4000" "4001" "4002" "4003" "4400" "4401" "4402" "4403" "4500" "4501" "4502" "4503")
for p in "${PORTS[@]}"; do
  PID=$(lsof -tiTCP:$p -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "Killing PID $PID on port $p"
    kill -9 $PID || true
  fi
done
