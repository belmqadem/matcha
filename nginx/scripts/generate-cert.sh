#!/bin/sh
set -e

apk add --no-cache openssl > /dev/null 2>&1

CERT_DIR=/etc/nginx/certs

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/localhost.crt" ]; then
  openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout "$CERT_DIR/localhost.key" \
    -out "$CERT_DIR/localhost.crt" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
fi

exec nginx -g 'daemon off;'
