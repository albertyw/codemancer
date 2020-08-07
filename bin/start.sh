#!/bin/bash

set -exuo pipefail
IFS=$'\n\t'

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
BASE_DIR="$DIR"/..
cd "$BASE_DIR" || exit 1

# Create minified files while host directories are mounted
npm run minify

# Need to make sure dev dependencies are available in case the container gets relaunched
# npm prune --production

# Run app
ts-node server/app.ts
