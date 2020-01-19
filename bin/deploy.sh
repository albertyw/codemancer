#!/bin/bash

# This script will build and deploy a new docker image

set -exuo pipefail
IFS=$'\n\t'

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$DIR"/..

source .env

if [ "$ENV" = "production" ]; then
    # Update repository
    git checkout master
    git fetch -tp
    git pull
fi

# Build and start container
docker pull "$(grep FROM Dockerfile | awk '{print $2}')"
docker build -t "codemancer:$ENV" .
docker network inspect "codemancer" &>/dev/null ||
    docker network create --driver bridge "codemancer"
docker stop codemancer || true
docker container prune --force --filter "until=168h"
docker image prune --force --filter "until=168h"
docker volume prune --force
docker container rm codemancer || true
docker run \
    --detach \
    --restart always \
    --publish 127.0.0.1:5002:5002 \
    --network="codemancer" \
    --mount type=bind,source="$(pwd)"/logs,target=/var/www/app/logs \
    --mount type=bind,source="$(pwd)"/codemancer,target=/var/www/app/codemancer \
    --name codemancer "codemancer:$ENV"

if [ "$ENV" = "production" ]; then
    # Cleanup docker
    docker image prune --force --filter "until=168h"

    # Update nginx
    sudo service nginx reload
fi
