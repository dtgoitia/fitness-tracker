#!/usr/bin/env bash

webapp_dir="webapp"
echo "Changing directory to '${webapp_dir}' directory..."
cd $webapp_dir || exit 1

echo "Kicking off CI-like webapp build..."
CI="true" npm run build

last_exit_code=$?

if [ "${last_exit_code}" != "0" ]; then
    echo "ERROR: exiting with exit code ${last_exit_code}"
    exit "${last_exit_code}"
fi
