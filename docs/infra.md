# Infrastructure

## Frontend
- **Vercel** — Next.js 15 App Router, root directory `frontend`
- Environment: `NEXT_PUBLIC_API_URL=https://api.ringlink.app/api/v1`

## Backend
- **VPS** with Docker Compose (`docker-compose.prod.yml`)
- **PHP 8.4-FPM Alpine** — Laravel 12 API
- **Nginx 1.27-alpine** — reverse proxy, ports 80/443
- Custom API config: `.docker/nginx/prod-api.conf`

## Services

| Service | Image | Notes |
|---|---|---|
| MySQL | `mysql:8.4` | persistent volume `mysql_prod` |
| Redis | `redis:7-alpine` | queue backend |
| Queue worker | `php:8.4-fpm-alpine` (built) | `php artisan queue:work` |
| Scheduler | `php:8.4-fpm-alpine` (built) | `php artisan schedule:run` every 60s |

## Storage
- **Cloudflare R2** — wrestler media uploads (S3-compatible)
- `RINGLINK_UPLOAD_DISK=r2` in production
- Optional CDN hostname `media.ringlink.app` → R2 public bucket

## Local Development

```bash
docker compose up        # starts app, nginx (port 8000 by default), mysql (port 3307), redis (port 6379)
```

Dev MySQL port is `3307` to avoid collisions with a local MySQL instance.

## CI / CD

- **CI** (`.github/workflows/ci.yml`): backend (Composer, Pint, MySQL migrations, Pest) + MVP integrity script + frontend (lint, typecheck, vitest)
- **Deploy backend** (`.github/workflows/deploy-backend.yml`): SSH deploy to VPS
- **Deploy frontend** (`.github/workflows/deploy-frontend-vercel.yml`): Vercel deployment
