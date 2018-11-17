#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
BASE_DIR="$DIR"/..
cd $BASE_DIR

node_modules/.bin/static --host-address=0.0.0.0 --port=5002 --gzip=true "$BASE_DIR/codemancer"
