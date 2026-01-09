# Stage 1: Build Tailwind CSS
FROM debian:bookworm-slim AS builder

WORKDIR /build

# Copy Tailwind binary and source
COPY tailwindcss-linux-x64 ./tailwindcss
COPY src/frontend ./src/frontend

RUN chmod +x ./tailwindcss && \
    ./tailwindcss -i ./src/frontend/index.css -o ./src/frontend/style.css --minify

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built frontend assets
COPY --from=builder /build/src/frontend /usr/share/nginx/html

# Copy custom nginx config
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script for runtime env var substitution
COPY docker/frontend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
