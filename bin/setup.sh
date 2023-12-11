#!/bin/bash

set -exuo pipefail
IFS=$'\n\t'

# Setup server
sudo hostnamectl set-hostname "codemancer.com"

# Clone repository
cd ~ || exit 1
git clone git@github.com:albertyw/codemancer

# Set up docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce
sudo usermod -aG docker "${USER}"

# Configure nginx
sudo rm -rf /etc/nginx/sites-available
sudo rm -r /var/www/html

# Secure nginx
sudo mkdir -p /etc/nginx/ssl
curl https://ssl-config.mozilla.org/ffdhe2048.txt | sudo tee /etc/nginx/ssl/dhparams.pem > /dev/null
# Copy server.crt and server.key to /etc/nginx/ssl
docker exec nginx /etc/init.d/nginx reload

# Set up directory structures
ln -s .env.production .env
