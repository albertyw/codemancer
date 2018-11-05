#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd $DIR/..

# Set locale
sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && locale-gen

# Install node dependencies
curl -sL https://deb.nodesource.com/setup_11.x | bash -
apt-get update
apt-get install -y nodejs npm
npm install

# Write current version to temp file
apt-get install -y git
git rev-parse HEAD > codemancer/version
