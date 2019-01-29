#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd $DIR/..

# Set locale
sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && locale-gen

# Install node dependencies
curl -sL https://deb.nodesource.com/setup_11.x | bash -
apt-get update
apt-get install -y git nodejs npm
npm install --only=prod

# Set up .env
ln -s .env.production .env

# Compile code
npm run dist-min
