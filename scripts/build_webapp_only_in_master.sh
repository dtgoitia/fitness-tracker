#!/usr/bin/env bash

BUILD_BEFORE_PUSHING="${BUILD_BEFORE_PUSHING:-true}"

echo "Checking branch..."
current_branch=$(git branch --show-current)
echo "current_branch=$current_branch"

if [ "${current_branch}" != "master" ]; then
    echo "Aborting build as you are not in 'master' branch"
    exit 0
fi

echo "Cool, you are in 'master' branch"

if [[ "${BUILD_BEFORE_PUSHING}" == "false" ]]; then
    echo "BUILD_BEFORE_PUSHING is set to 'false', skipping build"
else
    scripts/build_webapp.sh
fi
