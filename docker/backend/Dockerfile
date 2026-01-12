FROM php:8.5-fpm-alpine

RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    imagemagick \
    imagemagick-dev \
    $PHPIZE_DEPS

RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j$(nproc) gd pdo pdo_mysql

RUN pecl install imagick && \
    docker-php-ext-enable imagick

RUN apk del $PHPIZE_DEPS && \
    rm -rf /var/cache/apk/*

RUN echo "upload_max_filesize = 10M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "post_max_size = 12M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "memory_limit = 128M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /var/www/html

COPY src/backend ./src/backend

RUN cp ./src/backend/Core/Config.example.php ./src/backend/Core/Config.php

RUN mkdir -p ./uploads && chown -R www-data:www-data ./uploads

RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000

CMD ["php-fpm"]
