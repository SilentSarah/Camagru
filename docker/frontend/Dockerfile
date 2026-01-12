FROM debian:bookworm-slim AS builder

WORKDIR /build

COPY src/frontend ./src/frontend

RUN apt-get update && apt-get install -y curl ca-certificates && \
    curl -sL https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64 -o tailwindcss && \
    chmod +x tailwindcss && \
    ./tailwindcss -i ./src/frontend/index.css -o ./src/frontend/style.css --minify

FROM nginx:alpine

COPY --from=builder /build/src/frontend /usr/share/nginx/html

COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY docker/frontend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
