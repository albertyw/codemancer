#!/bin/bash

set -exuo pipefail
IFS=$'\n\t'

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
BASE_DIR="$DIR"/..
cd "$BASE_DIR" || exit 1

npm run minify
node_modules/.bin/tsc
# Need to make sure dev dependencies are available in case the container gets relaunched
# npm prune --production
node built/server/app.js
