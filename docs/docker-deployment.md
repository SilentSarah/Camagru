# Docker Deployment Guide

This document explains how to build and run the Camagru application using Docker containers.

---

## Architecture

The application is split into separate containers for better scalability and maintainability:

| Container    | Purpose                                                 | Base Image           |
| ------------ | ------------------------------------------------------- | -------------------- |
| **frontend** | Serves static files (HTML/JS/CSS), proxies API requests | `nginx:alpine`       |
| **backend**  | Processes PHP/API requests                              | `php:8.2-fpm-alpine` |
| **mariadb**  | Database                                                | `mariadb:latest`     |
| **adminer**  | Database admin UI (dev only)                            | `adminer:latest`     |

```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │
│  (Nginx:80)     │     │  (PHP-FPM:9000) │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │    MariaDB      │
         │              │   (MySQL:3306)  │
         └──────────────┴─────────────────┘
```

---

## Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose v2+

### Build and Run

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Access Points

- **Application**: http://localhost
- **Adminer (DB UI)**: http://localhost:8080

---

## Configuration

### Environment Variables

The backend container accepts these environment variables (set in `docker-compose.yml`):

| Variable      | Description       | Default   |
| ------------- | ----------------- | --------- |
| `DB_HOST`     | Database hostname | `mariadb` |
| `DB_NAME`     | Database name     | `CAMAGRU` |
| `DB_USER`     | Database user     | `ROOT`    |
| `DB_PASSWORD` | Database password | `ROOT`    |

### Volumes

| Volume    | Purpose                     |
| --------- | --------------------------- |
| `db_data` | Persistent database storage |
| `uploads` | User-uploaded images        |

### Database Initialization

Tables are **automatically created** on first startup via `docker/db/init.sql`, which is mounted into MariaDB's `/docker-entrypoint-initdb.d/` directory.

**To reset the database:**

```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Recreate with fresh schema
```

---

## Production Deployment

For cloud deployment, consider these modifications:

### 1. Use Environment Files

Create a `.env` file instead of hardcoding credentials:

```env
DB_HOST=your-cloud-db-host
DB_NAME=camagru
DB_USER=app_user
DB_PASSWORD=secure_password
```

### 2. External Database

Replace the `mariadb` service with a managed database (AWS RDS, Google Cloud SQL, etc.):

```yaml
backend:
  environment:
    - DB_HOST=${DB_HOST}
    - DB_NAME=${DB_NAME}
    - DB_USER=${DB_USER}
    - DB_PASSWORD=${DB_PASSWORD}
```

### 3. HTTPS/SSL

Add a reverse proxy (Traefik, Caddy, or cloud load balancer) in front of the frontend container.

### 4. Persistent Storage

Mount `uploads` to a cloud storage solution (S3, GCS) or use a persistent volume claim (Kubernetes).

---

## Directory Structure

```
docker/
├── frontend/
│   ├── Dockerfile      # Multistage: Tailwind build → Nginx
│   └── nginx.conf      # Routes static files + FastCGI proxy
└── backend/
    └── Dockerfile      # PHP-FPM with Imagick, GD, PDO
```

---

## Troubleshooting

### Container won't start

```bash
docker-compose logs backend  # Check PHP errors
docker-compose logs frontend # Check Nginx errors
```

### Database connection issues

Ensure `DB_HOST` matches the service name in docker-compose (`mariadb`).

### Image processing fails

Verify Imagick is installed:

```bash
docker-compose exec backend php -m | grep imagick
```
