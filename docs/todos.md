# MVP TODO Completion Status

## Completed in-repo
- [x] Enum definitions for roles and key workflow statuses.
- [x] Submission + booking state transition maps.
- [x] API v1 endpoint contract baseline.
- [x] Full MVP SQL schema baseline for all required core tables.
- [x] Docker and CI scaffolding.
- [x] OpenAPI baseline and architecture notes.

## Blocked by environment (external package access)
- [ ] Full Laravel 12 framework bootstrap in repository root.
- [ ] Sanctum/mail/queue provider wiring inside Laravel runtime.
- [ ] Executable Feature/API tests via `php artisan test`.

### Blocker details
Attempting to fetch Laravel via Composer/GitHub fails in this execution environment due outbound proxy restrictions (`CONNECT tunnel failed, response 403`). Once network access to Packagist/GitHub is available, these final unchecked items can be completed immediately.
