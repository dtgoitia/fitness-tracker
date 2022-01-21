#!/usr/bin/env bash

echo "Checking branch..."
current_branch=$(git branch --show-current)
echo "current_branch=$current_branch"

if [ "${current_branch}" != "master" ]; then
    echo "Aborting build as you are not in 'master' branch"
    exit 0
fi

echo "Cool, you are in 'master' branch"

scripts/build_webapp.sh
