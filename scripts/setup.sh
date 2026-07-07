#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  . "$PROJECT_DIR/.env"
  set +a
fi

ROOT_DIR="${ROOT_DIR:-$PROJECT_DIR}"

cd "$ROOT_DIR"

echo "==> Installing npm dependencies"
npm ci

echo "==> Installing Quartz plugins"
node ./quartz/bootstrap-cli.mjs plugin install

echo "==> Setup finished"
