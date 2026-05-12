# MVP Roadmap

## Sprint 1 — Auth & Infrastructure ✅
- User registration with role selection (`wrestler`, `promotion`, `admin`)
- Sanctum token auth (login / logout / me)
- Role-based middleware
- Docker Compose (PHP-FPM, Nginx, MySQL, Redis, queue worker, scheduler)
- CI pipeline (Pint, migrations, Pest, frontend lint/typecheck/vitest)

## Sprint 2 — Profiles & Media ✅
- Wrestler profile CRUD (ring name, style, gimmick, rates, travel radius, etc.)
- Promotion profile CRUD (name, city, branding)
- Two-step media upload via Cloudflare R2 signed URLs
- Media reordering
- Availability windows

## Sprint 3 — Discovery ✅
- Public wrestler listing with composable filters (state, style, gender, rate range, availability overlap)
- Saved talent shortlist for promotions

## Sprint 4 — Messaging & Notifications ✅
- Conversation threads scoped to bookings
- Messages with read receipts + unread count
- In-app notification records
- Async notification/alert jobs via Redis queue

## Sprint 5 — Booking Workflows & Reviews ✅
- Event creation and management (promotion)
- Submission workflow: 9-state machine (`submitted → … → completed`)
- Booking workflow: 5-state machine (`pending → … → completed`)
- Verified post-booking reviews with 6 rating dimensions
- Admin review moderation
- Async wrestler rating recalculation job
- Audit logging via observers

## Next Priorities
- [ ] Larastan static analysis
- [ ] Newman/Postman collection in CI for smoke API checks
- [ ] Production hardening: rate limiting, request IDs, Sentry integration
- [ ] Real-time messaging (WebSockets / Laravel Reverb)
- [ ] Wrestler profile public page (frontend)
- [ ] Booking dashboard (frontend)
