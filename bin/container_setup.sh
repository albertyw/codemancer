#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$DIR/.." || exit 1

# Set locale
sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && locale-gen

# Install node dependencies
curl -sL https://deb.nodesource.com/setup_11.x | bash -
apt-get update
apt-get install -y git nodejs npm

# Set up .env
ln -s .env.production .env

# Compile code
npm install
npm run minify
npm prune --production
