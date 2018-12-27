#!/bin/bash

# Setup server
sudo hostnamectl set-hostname "codemancer.com"

# Clone repository
cd ~
git clone git@github.com:albertyw/codemancer

# Install nginx
sudo add-apt-repository ppa:nginx/stable
sudo apt-get update
sudo apt-get install -y nginx

# Configure nginx
sudo rm -rf /etc/nginx/sites-available
sudo rm -rf /etc/nginx/sites-enabled/*
sudo ln -s ~/codemancer/config/nginx/app /etc/nginx/sites-enabled/codemancer-app
sudo ln -s ~/codemancer/config/nginx/headers /etc/nginx/sites-enabled/codemancer-headers
sudo rm -r /var/www/html

# Secure nginx
sudo mkdir -p /etc/nginx/ssl
sudo openssl dhparam -out /etc/nginx/ssl/dhparams.pem 2048
# Copy server.crt and server.key to /etc/nginx/ssl
sudo service nginx restart

# Set up docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce
sudo usermod -aG docker ${USER}
