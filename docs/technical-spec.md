# RingLink Technical Specification

## Product Summary

RingLink is a talent marketplace for independent professional wrestling. Wrestlers list themselves, promotions post events, and the platform manages the booking workflow end-to-end — from submission of interest through confirmed booking, in-ring event, and verified post-show review.

## Architecture

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, deployed to Vercel
- **Backend**: Laravel 12 / PHP 8.4 monolith, deployed via Docker on VPS
- **Database**: MySQL 8.4
- **Queue / Cache**: Redis 7
- **Storage**: Cloudflare R2 (S3-compatible) for wrestler media
- **Auth**: Laravel Sanctum (token-based, Bearer header)

## User Roles

| Role | Description |
|---|---|
| `wrestler` | Creates a profile, sets availability, submits to events |
| `promotion` | Creates promotion + events, manages bookings, leaves reviews |
| `admin` | Moderates reviews |

## Feature Modules

### 1. Authentication
- Register with role selection (`wrestler` / `promotion`)
- Login returns Sanctum token
- Role-based middleware enforces access control per route

### 2. Wrestler Profiles
- Ring name, hometown, state, style, gimmick, match types
- Booking rate range (min/max, in cents)
- Travel radius, years experience, gender division
- Social links (JSON), media gallery
- `average_rating` and `review_count` maintained by async job after each review
- Soft-deleted to preserve booking history

### 3. Promotion Profiles
- Promotion name, city, state
- Branding JSON (colors, logo)
- One profile per user

### 4. Events
- Created and owned by a PromotionProfile
- Fields: name, venue, city, state, `starts_at`
- Soft-deleted

### 5. Talent Discovery
- Public `GET /wrestlers` endpoint with composable filters:
  - State, wrestling style, gender division, years experience
  - Booking rate range overlap
  - Availability window overlap (`available_from` / `available_to`)
- Promotions can save wrestlers to a shortlist (`saved_talent`)

### 6. Submission Workflow
Wrestlers express interest in a specific event. The promotion steers the submission through a state machine:

`submitted → reviewing → interested → offer_sent → accepted → booked → completed`

Any state → `declined` or `cancelled`

Transitions are validated by `App\Support\StateTransitions::submission()`.

### 7. Booking Workflow
When a submission reaches `accepted`, a Booking is created:

`pending → confirmed → in_progress → completed`

Any non-terminal state → `cancelled`

Bookings link a submission, promotion profile, wrestler profile, fee (cents), and booked date. Each booking has one Conversation thread and one optional VerifiedBookingReview.

Transitions validated by `App\Support\StateTransitions::booking()`.

### 8. Messaging
- Conversations are scoped to a booking
- Participants exchange messages with read receipts (`read_at`)
- `GET /messages/unread-count` for UI badges

### 9. Media Uploads
- Two-step: `POST /media/upload-intent` returns a signed R2 URL; client uploads directly; `POST /media/confirm` creates the `MediaLink` record
- `RINGLINK_UPLOAD_DISK` env var switches between `r2` (production) and `public` (test/CI)
- Wrestlers can reorder media via `PATCH /wrestlers/{id}/media/order`

### 10. Availability Windows
- Wrestlers declare open date ranges via `POST /wrestlers/availability`
- Used as a discovery filter

### 11. Verified Reviews
- One review per completed booking, submitted by the promotion only
- Six rating dimensions (1–5): overall, professionalism, communication, in-ring, reliability, crowd reaction
- Requires admin moderation (`pending → approved | rejected`) before affecting ratings
- Approved reviews trigger `RecalculateWrestlerRatingJob` to recompute `average_rating` and `review_count`

### 12. Notifications
- In-app notification records stored in `notifications` table
- Async delivery via `SendRinglinkAlertJob` (Redis queue)
- Optional email via `RinglinkAlertMail`

### 13. Audit Logging
- `WriteAuditLogAction` records key actor/action/entity tuples to `audit_logs`
- Fired by observers on Booking, Submission, and VerifiedBookingReview

### 14. Scheduled Jobs
- `ringlink:backup-db` — daily database backup (requires `mysqldump` in container, included in Alpine Dockerfile via `mysql-client`)

## Testing

- **Pest** feature tests under `backend/tests/Feature/`
- CI runs: `composer install → pint --test → php artisan migrate → php artisan test`
- Frontend CI runs: `npm ci → lint → typecheck → vitest --run`
- MVP integrity script: `backend/scripts/check_mvp.sh`

## Key Environment Variables

| Variable | Purpose |
|---|---|
| `APP_KEY` | Laravel encryption key |
| `DB_*` | MySQL connection |
| `REDIS_*` | Redis connection |
| `RINGLINK_UPLOAD_DISK` | `r2` or `public` |
| `R2_*` | Cloudflare R2 credentials and bucket |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins |
| `SENTRY_LARAVEL_DSN` | (optional) error tracking |
