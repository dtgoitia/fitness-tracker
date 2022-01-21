#!/usr/bin/env bash

local_ip=$(scripts/get_local_ip.py)
echo "Local IP: ${local_ip}"

docker-compose run --rm qr python generate.py "${local_ip}"
