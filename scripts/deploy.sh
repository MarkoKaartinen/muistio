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
CONTENT_DIR="${CONTENT_DIR:-content}"
PUBLISH_DIR="${PUBLISH_DIR:-/var/www/muistio-site}"
PUBLISH_HOST="${PUBLISH_HOST:-}"
PUBLISH_USER="${PUBLISH_USER:-}"
PUBLISH_PORT="${PUBLISH_PORT:-22}"

cd "$ROOT_DIR"

echo "==> Building site"
node ./quartz/bootstrap-cli.mjs build -d "$CONTENT_DIR"

if [ ! -d public ]; then
  echo "public/ not found after build."
  exit 1
fi

if [ -n "$PUBLISH_HOST" ] && [ -n "$PUBLISH_USER" ]; then
  REMOTE_TARGET="${PUBLISH_USER}@${PUBLISH_HOST}:${PUBLISH_DIR}"

  echo "==> Publishing public/ to $REMOTE_TARGET"
  rsync -avc --delete -e "ssh -p $PUBLISH_PORT" public/ "$REMOTE_TARGET"/
else
  mkdir -p "$PUBLISH_DIR"

  echo "==> Publishing public/ to $PUBLISH_DIR"
  rsync -avc --delete public/ "$PUBLISH_DIR"/
fi

echo "==> Deploy finished"
