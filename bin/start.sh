#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
BASE_DIR="$DIR"/..
cd $BASE_DIR

node app.js
