#!/bin/bash

# This script will build and deploy a new docker image

set -exuo pipefail
IFS=$'\n\t'

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$DIR"/.. || exit 1

CONTAINER="codemancer"
PORT="5002"
NETWORK="codemancer_net"
DEPLOY_BRANCH="${1:-}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
VERSION="$(git describe --always)"
set +x  # Do not print contents of .env
source .env
set -x

if [ -n "$DEPLOY_BRANCH" ]; then
    # Update repository
    git checkout "$DEPLOY_BRANCH"
    git fetch -tp
    git pull
fi

# Build container and network
docker build \
    --pull \
    --tag "$CONTAINER:$BRANCH" \
    --build-arg GIT_VERSION="$VERSION" \
    .
docker network inspect "$NETWORK" &>/dev/null ||
    docker network create --driver bridge "$NETWORK"

# Start container
docker stop "$CONTAINER" || true
docker container rm "$CONTAINER" || true
docker run \
    --detach \
    --restart=always \
    --publish="127.0.0.1:$PORT:3000" \
    --network="$NETWORK" \
    --mount type=bind,source="$(pwd)"/logs,target=/var/www/app/logs \
    --mount type=bind,source="$(pwd)"/dist,target=/var/www/app/dist \
    --name="$CONTAINER" "$CONTAINER:$BRANCH"

if [ "$ENV" = "production" ] && [ "$BRANCH" = "master" ]; then
    # Cleanup docker
    docker system prune --force --filter "until=168h"
    docker volume prune --force

    # Update nginx
    sudo cp ~/codemancer/config/nginx/app /etc/nginx/sites-enabled/codemancer-app
    docker exec nginx /etc/init.d/nginx reload
fi
