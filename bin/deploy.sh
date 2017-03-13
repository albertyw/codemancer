#!/bin/bash

# Update repository
cd /var/www/website/ || exit 1
git checkout master
git pull

# Make generated static file directory writable
sudo chown www-data app/static/gen
sudo chown www-data app/static/.webassets-cache

# Restart services
sudo service nginx restart
