# MVP TODO Completion Status

## Completed in-repo
- [x] Enum definitions for roles and key workflow statuses.
- [x] Submission + booking state transition maps (`App\Support\StateTransitions`).
- [x] API v1 endpoints implemented under `backend/routes/api.php` (prefix `/api/v1`).
- [x] Laravel migrations for all core tables (14 tables, see `docs/database-schema.md`).
- [x] Docker Compose (PHP-FPM, Nginx, MySQL, Redis, queue worker, scheduler) mounting `backend/`.
- [x] OpenAPI baseline (`api/openapi.yaml`) — extend schemas as the contract hardens.
- [x] Laravel 12 app in `backend/` with Sanctum, actions/services, policies, Pest feature tests.
- [x] Cloudflare R2 disk config (`filesystems.disks.r2`) and signed upload intent flow.
- [x] CI: backend (Composer, Pint, MySQL migrations, `php artisan test`), MVP integrity script, frontend checks.

## Optional / ongoing
- [ ] Larastan static analysis (add `larastan/larastan` when Composer can reach all dist hosts).
- [ ] Newman/Postman collection in CI for smoke API checks.
- [ ] Production hardening: rate limits, request IDs, expanded observability.
