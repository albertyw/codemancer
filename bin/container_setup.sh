#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd $DIR/..

# Set locale
sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && locale-gen

# Install nginx
add-apt-repository ppa:nginx/stable
apt-get update
apt-get install -y nginx

# Configure nginx
rm -rf /etc/nginx/sites-available
rm -rf /etc/nginx/sites-enabled/*
cp config/sites-available-container/app /etc/nginx/sites-enabled/codemancer-app
rm -r /var/www/html

# Install node dependencies
apt-get update
apt-get install -y nodejs npm
npm install

# Write current version to temp file
apt-get install -y git
git rev-parse HEAD > codemancer/version
