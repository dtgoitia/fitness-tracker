#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

local_static_web_server_port="${1}"
source_dir='webapp/dist'
target_dir='webapp/ngrok-dist'
website_base_path='fitness-tracker'

info () {
    local message="${1}"
    echo >&2 "INFO:${message}"
}

info "emptying target directory: ${target_dir}"
rm -rf "${target_dir}"
mkdir -p "${target_dir}"

info "copying build into target directory: ${target_dir}"
mv "${source_dir}" "${target_dir}/${website_base_path}"

info "serving static content in ${target_dir}"
python -m http.server "${local_static_web_server_port}" -d "${target_dir}"
