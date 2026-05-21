#!/bin/sh
set -eu

mode="${GATEWAY_UPSTREAM_MODE:-host}"
case "$mode" in
  host|docker) ;;
  *)
    echo "gateway: invalid GATEWAY_UPSTREAM_MODE=$mode (expected host or docker)" >&2
    exit 1
    ;;
esac

if [ ! -f /etc/nginx/certs/k-project.com.pem ] || [ ! -f /etc/nginx/certs/k-project.com-key.pem ]; then
  echo "gateway: missing TLS certs in /etc/nginx/certs/" >&2
  echo "gateway: run ./infra/gateway/gen-certs.sh on the host, then restart gateway" >&2
  exit 1
fi

cp "/etc/nginx/gateway/nginx.${mode}.conf" /etc/nginx/conf.d/default.conf
echo "gateway: upstream mode=$mode (https://k-project.com)"

exec nginx -g 'daemon off;'
