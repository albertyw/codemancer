FROM node:18-slim

LABEL maintainer="git@albertyw.com"
EXPOSE 5002
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Set locale
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
RUN apt-get update && apt-get install -y --no-install-recommends \
    locales                                     `: Basic-packages` \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git                                    `: Needed for installing dependencies` \
    && rm -rf /var/lib/apt/lists/*

# Set up directory structures
RUN mkdir -p /var/www/app
COPY . /var/www/app
WORKDIR /var/www/app

# App-specific setup
RUN npm ci --only=production

CMD ["bin/start.sh"]
