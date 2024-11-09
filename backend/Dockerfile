# Etapa 1: Construção
FROM node:latest AS node-builder

WORKDIR /app

# Copia arquivos da aplicação e instala dependências
COPY . /app
RUN yarn install

# Etapa 2: PHP
FROM php:8.2-fpm

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip

# Limpar cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensões do PHP
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd sockets

# Obter o Composer mais recente
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar configurações personalizadas do PHP
COPY docker/php/custom.ini /usr/local/etc/php/conf.d/custom.ini

# Definir diretório de trabalho
WORKDIR /var/www

# Copiar arquivos da aplicação
COPY . /var/www

# Criar usuário do sistema para executar comandos Composer e Artisan
ARG user=myuser
ARG uid=1000
RUN useradd -m -u $uid -G www-data,root -s /bin/bash $user \
    && mkdir -p /home/$user/.composer \
    && chown -R $user:$user /home/$user

# Temporariamente execute os comandos como root para instalar o Redis
USER root
RUN pecl install -o -f redis \
    && rm -rf /tmp/pear \
    && docker-php-ext-enable redis

# Retornar ao usuário definido
USER $user

# Copiar node_modules da etapa de construção
COPY --from=node-builder /app/node_modules /var/www/node_modules

# Instalar dependências do Composer do PHP
RUN composer install

# Comando para executar a aplicação
# CMD ["./start.sh"]
