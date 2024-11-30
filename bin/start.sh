#!/bin/bash

set -exuo pipefail
IFS=$'\n\t'

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
BASE_DIR="$DIR"/..
cd "$BASE_DIR" || exit 1

# Create minified files while host directories are mounted
npm run build:prod

# Run app
node --loader ts-node/esm server/app.ts
