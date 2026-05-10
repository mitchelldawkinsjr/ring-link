# RingLink

RingLink is a wrestling talent marketplace platform connecting professional wrestlers and wrestling promotions.

## Stack
- Next.js
- Laravel API (target)
- MySQL 8
- Redis
- Docker
- Cloudflare R2

## Current Repository Status
This repository started as a product/design/architecture source-of-truth workspace. It now includes backend delivery scaffolding:

- Docker Compose baseline with required service topology
- Nginx configuration for Laravel API serving
- CI workflow placeholder for PHP/Laravel checks
- OpenAPI baseline (`api/openapi.yaml`)
- Architecture summary and execution TODOs

## Local Development (Docker)

```bash
docker compose up -d
```

Services:
- `app` (PHP-FPM)
- `nginx` (port `8080`)
- `mysql` (port `3307`)
- `redis` (port `6379`)
- `queue-worker`
- `scheduler`

## Next Implementation Step
Scaffold Laravel 12 app in repository root, then wire:
- Sanctum auth
- role onboarding
- migrations/models/policies/resources
- action/service workflow classes
- feature/API test suite

See `/docs/architecture-summary.md` and `/docs/todos.md`.


## MVP Backend Build (Current)

A Laravel-ready backend implementation baseline now exists under `backend/` including:
- role/status enums
- state transition maps for submissions/bookings
- initial SQL migration baseline for core identity/profile schema
- API route contract map
- feature test plan for workflow coverage

> Note: full Laravel framework bootstrap was attempted but package download is blocked in this environment (Packagist CONNECT tunnel 403).


## Local Artifact Validation

Run repository-level MVP checks in this environment:

```bash
bash backend/scripts/check_mvp.sh
```

This validates schema/table coverage, OpenAPI core paths, workflow states, and required docs.

## API Client Collection

A Postman collection is available at:
- `backend/postman/RingLink-MVP.postman_collection.json`
