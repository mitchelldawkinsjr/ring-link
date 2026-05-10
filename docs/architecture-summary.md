# RingLink MVP Backend Foundation (Phase 1)

## Scope Implemented in this commit

This repository initially contained product/design/documentation references only. This foundation commit adds implementation scaffolding for backend delivery:

- Dockerized local environment baseline (`app`, `nginx`, `mysql`, `redis`, `queue-worker`, `scheduler`)
- Nginx config for Laravel API routing
- CI workflow baseline for PHP/Laravel pipelines
- OpenAPI v1 baseline for MVP endpoint families
- MVP implementation backlog split by delivery slices

## API/Architecture Direction

- API prefix: `/api/v1`
- Response envelope:
  - `data`
  - `meta`
  - `message`
- Backend model: modular Laravel monolith (service/action pattern)
- Auth: Sanctum + role-based onboarding (`wrestler`, `promotion`, `admin`)
- Workflows: enum-backed status machines for submissions/bookings/review moderation
- Asynchronous flows: Redis queue-backed notifications and aggregate recalculation jobs

## Data Model Intent (MVP)

Core entities to implement:

- `users`
- `wrestler_profiles`
- `promotion_profiles`
- `events`
- `submissions`
- `bookings`
- `conversations`
- `messages`
- `media_links`
- `availability_windows`
- `verified_booking_reviews`
- `notifications`
- `saved_talent`
- `audit_logs`

## Frontend-Aware API Strategy

Design references indicate mobile-first cards, dashboard summaries, and messaging threads. API design should therefore prioritize:

- pagination and filter composability
- eager-loaded profile/media primitives (avoid N+1)
- compact list payloads + detailed show payloads
- dashboard aggregation endpoints
- consistent cursor/page metadata for infinite scroll

