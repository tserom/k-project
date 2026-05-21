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

cp "/etc/nginx/gateway/nginx.${mode}.conf" /etc/nginx/conf.d/default.conf
echo "gateway: upstream mode=$mode"

exec nginx -g 'daemon off;'
