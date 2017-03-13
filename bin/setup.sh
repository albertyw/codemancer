#!/bin/bash

# Setup directories
sudo ln -s ~/website /var/www/website

# Clone repository
git clone git@github.com:albertyw/currently-website
sudo mv git@github.com:albertyw/currently-website /var/www/website
cd /var/www/website || exit 1

# Install nginx
sudo add-apt-repository ppa:nginx/stable
sudo apt-get update
sudo apt-get install -y nginx

# Configure nginx
sudo mv /etc/nginx/sites-available /etc/nginx/sites-available.bak
sudo mv /etc/nginx/sites-enabled /etc/nginx/sites-enabled.bak
sudo ln -s /var/www/website/config/sites-available /etc/nginx/sites-available
sudo ln -s /var/www/website/config/sites-enabled /etc/nginx/sites-enabled
sudo service nginx restart
sudo rm -r /var/www/html

# Secure nginx
openssl dhparam -out /etc/nginx/ssl/dhparams.pem 2048
# Copy server.crt and server.key to /etc/nginx/ssl
sudo service nginx restart
