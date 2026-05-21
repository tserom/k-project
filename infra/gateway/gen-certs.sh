#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_DIR="${SCRIPT_DIR}/certs"
DOMAIN="k-project.com"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "mkcert not found. Install it first:" >&2
  echo "  brew install mkcert" >&2
  echo "  mkcert -install   # trust local CA (once)" >&2
  exit 1
fi

mkdir -p "${CERT_DIR}"
mkcert \
  -cert-file "${CERT_DIR}/${DOMAIN}.pem" \
  -key-file "${CERT_DIR}/${DOMAIN}-key.pem" \
  "${DOMAIN}"

echo
echo "Certificates written to ${CERT_DIR}/"
echo "Restart gateway:"
echo "  docker compose -f infra/docker/docker-compose.yml up gateway -d --build"
echo
echo "Open https://${DOMAIN}/"
