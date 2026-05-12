# RingLink

RingLink is a wrestling talent marketplace connecting professional wrestlers and wrestling promotions.

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind 3, TanStack Query, Zustand |
| API | Laravel 12, Sanctum (Bearer tokens), MySQL 8, Redis |
| Storage | Cloudflare R2 (S3 driver) for wrestler media |
| Local dev | Docker Compose (`backend/` is the Laravel app root) |

## Quick start (Docker)

```bash
cp backend/.env.example backend/.env
# Set APP_KEY, DB_* for MySQL service (see docker-compose.yml ports)

docker compose up -d
cd backend && composer install && php artisan migrate --seed
```

- API (via Nginx): `http://localhost:8000/api/v1` (override host port with `RINGLINK_NGINX_PORT` in `.env` if needed)
- MySQL: `127.0.0.1:3307` (user `ringlink` / pass `ringlink`, DB `ringlink`)

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` (must match the Nginx host port).

**Default admin (after seed):** `admin@ringlink.local` / `password` — change immediately in any shared environment.

## Repository layout

- [`backend/`](backend/) — Laravel application (migrations, actions, policies, Pest tests, Postman collection)
- [`frontend/`](frontend/) — Next.js PWA-oriented UI (manifest included; service worker can be added later)
- [`api/openapi.yaml`](api/openapi.yaml) — API contract (use `npm run generate:api` in `frontend/` to refresh TS types)
- [`docs/`](docs/) — product + deploy notes ([`docs/DEPLOY.md`](docs/DEPLOY.md) for VPS / Vercel / R2)

## Quality gates

```bash
cd backend && ./vendor/bin/pint --test && php artisan test
cd frontend && npm run lint && npm run typecheck && npm run test -- --run && npm run build
bash backend/scripts/check_mvp.sh
```

### E2E (local)

```bash
cd frontend && npx playwright install && npm run test:e2e
# Start API + Next dev servers first, or set PLAYWRIGHT_BASE_URL.
```

## CI

GitHub Actions **CI** workflow: backend (Composer, Pint, MySQL, tests), MVP integrity script, frontend (lint, tsc, Vitest).

Deploy templates: **Deploy backend (VPS)**, **Deploy frontend (Vercel)** (see [`docs/DEPLOY.md`](docs/DEPLOY.md)).

## API client

- Postman: [`backend/postman/RingLink-MVP.postman_collection.json`](backend/postman/RingLink-MVP.postman_collection.json)

## License

Proprietary — All rights reserved unless otherwise stated.
