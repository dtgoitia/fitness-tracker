#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

log () {
    message="${1}"
    echo >&2 "${message}"
}

local_ip=$(scripts/get_local_ip.py)
log "Local IP: ${local_ip}"

url="http://${local_ip}:3000/shopping-list"

log "Scan the QR code bellow to access the app:"
log ""
scripts/qr "${url}" 2>/dev/null
log ""
log "${url}"
log ""
