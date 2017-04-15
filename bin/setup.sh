#!/bin/bash

# Setup directories
sudo ln -s ~/website /var/www/website

# Clone repository
git clone git@github.com:albertyw/codemancer
sudo mv git@github.com:albertyw/codemancer /var/www/website
cd /var/www/website || exit 1

# Install nginx
sudo add-apt-repository ppa:nginx/stable
sudo apt-get update
sudo apt-get install -y nginx

# Configure nginx
sudo rm -r /etc/nginx/sites-available
sudo rm -r /etc/nginx/sites-enabled
sudo ln -s /var/www/website/config/sites-enabled /etc/nginx/sites-enabled
sudo service nginx restart
sudo rm -r /var/www/html

# Secure nginx
openssl dhparam -out /etc/nginx/ssl/dhparams.pem 2048
# Copy server.crt and server.key to /etc/nginx/ssl
sudo service nginx restart
