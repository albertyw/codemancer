#!/bin/bash

# Update repository
cd /var/www/website/ || exit 1
git checkout master
git pull

# Restart services
sudo service nginx restart
