#!/usr/bin/env sh
set -e
: "${PORT:=8080}"
: "${APP_PORT:=3000}"
export PORT APP_PORT
envsubst '$PORT $APP_PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
pm2 start /app/ecosystem.config.cjs --no-daemon &
trap "pm2 kill || true; exit 0" TERM INT
nginx -g 'daemon off;'
