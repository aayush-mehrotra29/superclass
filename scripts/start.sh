#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ ! -d frontend/.next ]]; then
  echo "Build the frontend first: cd frontend && npm run build" >&2
  exit 1
fi
uv run python -m backend.worker &
worker_pid=$!
uv run uvicorn backend.api:app --host 127.0.0.1 --port 8001 &
api_pid=$!
cleanup() { kill "$worker_pid" "$api_pid" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
cd frontend
npm run start
