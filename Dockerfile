FROM node:25-slim

ARG GIT_VERSION="master"
ENV GIT_VERSION=${GIT_VERSION}
LABEL maintainer="git@albertyw.com"
EXPOSE 3000
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Set locale
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
RUN apt-get update && apt-get install -y --no-install-recommends \
    locales                                     `: Basic-packages` \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates                        `: Needed for installing dependencies` \
    && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN curl -fsSL https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -

# Set up directory structures
RUN mkdir -p /var/www/app
COPY . /var/www/app
WORKDIR /var/www/app

# App-specific setup
RUN pnpm install --prod --frozen-lockfile

CMD ["bin/start.sh"]
