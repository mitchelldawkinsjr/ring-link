# Database Schema

## Tables

### `users`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| role | enum | `wrestler`, `promotion`, `admin` |
| name | varchar(120) | |
| email | varchar(190) unique | |
| password | varchar(255) | bcrypt hashed |
| email_verified_at | timestamp nullable | |
| remember_token | varchar(100) nullable | |
| created_at / updated_at | timestamps | |
| deleted_at | timestamp nullable | soft delete |

### `wrestler_profiles`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| user_id | bigint FK → users | unique |
| ring_name | varchar(120) | |
| hometown | varchar(120) nullable | |
| state | char(2) nullable | |
| wrestling_style | varchar(120) nullable | |
| match_types | JSON nullable | array of strings |
| gimmick | text nullable | |
| travel_radius_miles | smallint unsigned nullable | |
| years_experience | tinyint unsigned nullable | |
| gender_division | varchar(80) nullable | |
| booking_rate_min | int unsigned nullable | cents |
| booking_rate_max | int unsigned nullable | cents |
| social_links | JSON nullable | keyed URLs |
| review_count | int unsigned | default 0 |
| average_rating | decimal(3,2) nullable | recalculated by job |
| deleted_at | timestamp nullable | soft delete |

### `promotion_profiles`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| user_id | bigint FK → users | unique |
| promotion_name | varchar(120) | |
| city | varchar(120) nullable | |
| state | char(2) nullable | |
| branding | JSON nullable | colors, logo URL |
| description | text nullable | |
| deleted_at | timestamp nullable | soft delete |

### `events`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| promotion_profile_id | bigint FK → promotion_profiles | |
| name | varchar(120) | |
| starts_at | datetime | |
| venue | varchar(120) nullable | |
| city | varchar(120) nullable | |
| state | char(2) nullable | |
| deleted_at | timestamp nullable | soft delete |

### `submissions`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| event_id | bigint FK → events | |
| wrestler_profile_id | bigint FK → wrestler_profiles | |
| status | enum | see `SubmissionStatus` |
| note | text nullable | wrestler-supplied note |

**SubmissionStatus transitions:**
`submitted → reviewing → interested → offer_sent → accepted → booked → completed`
Any state can move to `declined` or `cancelled`.

### `bookings`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| submission_id | bigint FK → submissions | |
| promotion_profile_id | bigint FK → promotion_profiles | |
| wrestler_profile_id | bigint FK → wrestler_profiles | |
| status | enum | see `BookingStatus` |
| fee_cents | int unsigned nullable | agreed fee |
| booked_at | datetime nullable | |

**BookingStatus transitions:**
`pending → confirmed → in_progress → completed`
Any non-terminal state can move to `cancelled`.

### `conversations`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| booking_id | bigint FK → bookings | |

### `messages`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| conversation_id | bigint FK → conversations | |
| user_id | bigint FK → users | sender |
| body | text | |
| read_at | timestamp nullable | |

### `media_links`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| wrestler_profile_id | bigint FK → wrestler_profiles | |
| disk | varchar(20) | `r2` or `public` |
| path | varchar(500) | storage path |
| url | varchar(500) | public CDN URL |
| media_type | varchar(40) | e.g. `image`, `video` |
| sort_order | int unsigned | for display ordering |

### `availability_windows`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| wrestler_profile_id | bigint FK → wrestler_profiles | |
| starts_at | datetime | |
| ends_at | datetime | |

### `verified_booking_reviews`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| booking_id | bigint FK → bookings | unique, one per booking |
| promotion_profile_id | bigint FK → promotion_profiles | reviewer |
| wrestler_profile_id | bigint FK → wrestler_profiles | subject |
| overall_rating | tinyint unsigned | 1–5 |
| professionalism_rating | tinyint unsigned | 1–5 |
| communication_rating | tinyint unsigned | 1–5 |
| in_ring_rating | tinyint unsigned | 1–5 |
| reliability_rating | tinyint unsigned | 1–5 |
| crowd_reaction_rating | tinyint unsigned | 1–5 |
| review_text | text nullable | |
| moderation_status | varchar(20) | `pending`, `approved`, `rejected` |

### `notifications` (in-app)
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| user_id | bigint FK → users | recipient |
| type | varchar(80) | notification class name |
| data | JSON | payload |
| read_at | timestamp nullable | |

### `saved_talent`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| promotion_profile_id | bigint FK → promotion_profiles | |
| wrestler_profile_id | bigint FK → wrestler_profiles | |

### `audit_logs`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| user_id | bigint FK → users nullable | actor |
| action | varchar(120) | e.g. `booking.confirmed` |
| auditable_type | varchar(120) | morph type |
| auditable_id | bigint unsigned | morph id |
| payload | JSON nullable | context |

## Key Relationships

```
User (role=wrestler)       → WrestlerProfile (1:1)
User (role=promotion)      → PromotionProfile (1:1)

PromotionProfile           → Events (1:many)
Event                      → Submissions (1:many)
Submission                 → Booking (1:1)

Booking                    → Conversations (1:many)
Conversation               → Messages (1:many)
Booking                    → VerifiedBookingReview (1:1)

WrestlerProfile            → MediaLinks (1:many)
WrestlerProfile            → AvailabilityWindows (1:many)
PromotionProfile           → SavedTalent (1:many)  ← bookmarks wrestlers
```
