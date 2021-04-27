FROM debian:stable
LABEL maintainer="git@albertyw.com"
EXPOSE 5002
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Set locale
RUN apt-get update && apt-get install -y --no-install-recommends \
    locales \
    && rm -rf /var/lib/apt/lists/* \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gpg-agent software-properties-common curl   `: Needed for add-apt-repository` \
    build-essential curl                        `: Basic-packages` \
    gcc g++ make                                `: Needed for node native extensions` \
    git                                         `: Needed for pip install from github` \
    && curl https://deb.nodesource.com/setup_16.x | bash \
    && apt-get install -y --no-install-recommends \
    nodejs                                      `: Javascript` \
    && rm -rf /var/lib/apt/lists/*

# Set up directory structures
RUN mkdir -p /var/www/app
COPY . /var/www/app
WORKDIR /var/www/app

# App-specific setup
RUN bin/container_setup.sh

CMD ["bin/start.sh"]
