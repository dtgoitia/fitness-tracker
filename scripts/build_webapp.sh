#!/usr/bin/env bash

if [[ -z "${WEBAPP_NAME}" ]]; then
    echo "Please set WEBAPP_NAME environment variable"
    exit 1
fi

webapp_dir="webapp"
echo "Changing directory to '${webapp_dir}' directory..."
cd $webapp_dir || exit 1

echo "Kicking off CI-like webapp build..."
docker-compose run \
    --no-TTY \
    --env "CI=true" \
    --rm "${WEBAPP_NAME}" \
    npm run build

last_exit_code=$?

if [ "${last_exit_code}" != "0" ]; then
    echo "ERROR: exiting with exit code ${last_exit_code}"
    exit "${last_exit_code}"
fi
