FROM trafex/php-nginx:latest

RUN apt-get update && apt-get install -y \
    php8.4-mysql php8.4-cli php8.4-curl php8.4-mbstring php8.4-xml php8.4-gd
