# Architecture Summary

## Overview

RingLink is a wrestling talent marketplace connecting independent wrestlers with promotions. It is built as a pragmatic Laravel monolith API consumed by a Next.js frontend.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Laravel 12, PHP 8.4, Sanctum |
| Database | MySQL 8.4 |
| Cache / Queues | Redis 7 |
| Storage | Cloudflare R2 (S3-compatible) |
| Frontend hosting | Vercel |
| Backend hosting | VPS (Docker) |

## API Design

- Prefix: `/api/v1`
- JSON envelope: `{ data, meta, message }`
- Auth: Laravel Sanctum token-based (Bearer header)
- Roles: `wrestler`, `promotion`, `admin`
- Pagination and filter composability on discovery endpoints
- Compact list payloads + detailed show payloads
- Eager-loaded profile/media primitives to avoid N+1

## Backend Patterns

- **Service/action pattern** — thin controllers delegate to single-responsibility Action classes
- **Form Requests** for validation
- **Policies** for authorization
- **Enum-backed state machines** for submission and booking workflows
- **Observer pattern** for side effects (audit logs, rating recalculation, notifications)
- **Redis-backed queues** for async jobs (`RecalculateWrestlerRatingJob`, `SendRinglinkAlertJob`)
- **API Resources** for response shaping

## Core Domain

```
User
├── WrestlerProfile  (role=wrestler)
│   ├── MediaLinks
│   ├── AvailabilityWindows
│   └── Submissions → Bookings
└── PromotionProfile (role=promotion)
    ├── Events → Submissions → Bookings
    │                          └── Conversations → Messages
    │                          └── VerifiedBookingReview
    └── SavedTalent
```

## Workflow State Machines

### Submission
`submitted → reviewing → interested → offer_sent → accepted → booked → completed`
Any state → `declined` | `cancelled`

### Booking
`pending → confirmed → in_progress → completed`
Any non-terminal → `cancelled`

### Review moderation
`pending → approved` | `pending → rejected`

## Frontend

- TanStack Query for server state
- Zustand for lightweight client state
- Mobile-first responsive design
- Accessibility-compliant components

## Infrastructure

See `docs/infra.md` for service versions and `docs/DEPLOY.md` for deployment runbook.
