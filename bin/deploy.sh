#!/bin/bash

set -ex

# Update repository
cd /var/www/codemancer/ || exit 1
git checkout master
git pull

npm install

# Restart services
sudo service nginx restart

# Write current version to temp file
git rev-parse HEAD > codemancer/version
