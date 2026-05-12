# API Specification

## Base URL
`/api/v1`

## Response Envelope
All responses follow a consistent JSON envelope:
```json
{
  "data": {},
  "meta": {},
  "message": ""
}
```

---

## Public endpoints (no auth required)

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user (role required: `wrestler` \| `promotion`) |
| POST | `/auth/login` | Login, returns Sanctum token |

### Discovery
| Method | Path | Description |
|---|---|---|
| GET | `/wrestlers` | List wrestler profiles (filterable: `state`, `wrestling_style`, `gender_division`, `years_experience`, `booking_rate_min`, `booking_rate_max`, `available_from`, `available_to`) |
| GET | `/wrestlers/{wrestlerProfile}` | Show wrestler profile detail |
| GET | `/promotions` | List promotion profiles |
| GET | `/promotions/{promotionProfile}` | Show promotion profile detail |

---

## Authenticated endpoints (`Authorization: Bearer {token}`)

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/logout` | Revoke current token |
| GET | `/auth/me` | Return authenticated user |

### Wrestler profiles
| Method | Path | Description |
|---|---|---|
| POST | `/wrestlers` | Create wrestler profile (role: wrestler) |
| PATCH | `/wrestlers/{wrestlerProfile}` | Update wrestler profile |

### Promotion profiles
| Method | Path | Description |
|---|---|---|
| POST | `/promotions` | Create promotion profile (role: promotion) |
| PATCH | `/promotions/{promotionProfile}` | Update promotion profile |

### Events
| Method | Path | Description |
|---|---|---|
| GET | `/promotion/events` | List own promotion's events |
| POST | `/promotion/events` | Create event |
| PATCH | `/promotion/events/{event}` | Update event |
| DELETE | `/promotion/events/{event}` | Delete event |

### Submissions
| Method | Path | Description |
|---|---|---|
| POST | `/submissions` | Wrestler submits interest in an event |
| PATCH | `/submissions/{submission}/status` | Transition submission status |

### Bookings
| Method | Path | Description |
|---|---|---|
| POST | `/bookings` | Create booking (linked to a submission) |
| PATCH | `/bookings/{booking}/status` | Transition booking status |

### Reviews
| Method | Path | Description |
|---|---|---|
| POST | `/reviews` | Submit verified review (promotion only, requires completed booking) |
| PATCH | `/reviews/{verifiedBookingReview}/moderation` | Moderate a review (admin only) |

### Messaging
| Method | Path | Description |
|---|---|---|
| GET | `/conversations` | List own conversations |
| POST | `/conversations` | Start a conversation (linked to a booking) |
| GET | `/conversations/{conversation}/messages` | List messages in a conversation |
| POST | `/conversations/{conversation}/messages` | Send a message |
| PATCH | `/messages/{message}/read` | Mark message as read |
| GET | `/messages/unread-count` | Return count of unread messages |

### Media
| Method | Path | Description |
|---|---|---|
| POST | `/media/upload-intent` | Generate a signed R2 upload URL |
| POST | `/media/confirm` | Confirm upload and create `MediaLink` record |
| DELETE | `/media/{mediaLink}` | Delete a media link |
| PATCH | `/wrestlers/{wrestlerProfile}/media/order` | Reorder media items |

### Availability
| Method | Path | Description |
|---|---|---|
| POST | `/wrestlers/availability` | Set/replace availability windows |

### Saved talent
| Method | Path | Description |
|---|---|---|
| GET | `/promotion/saved-talent` | List saved wrestlers for own promotion |
| POST | `/promotion/saved-talent/{wrestlerProfile}` | Save a wrestler |
| DELETE | `/promotion/saved-talent/{wrestlerProfile}` | Unsave a wrestler |

---

## Status enums

### `SubmissionStatus`
`submitted → reviewing → interested → offer_sent → accepted → booked → completed`
Any state → `declined` or `cancelled`

### `BookingStatus`
`pending → confirmed → in_progress → completed`
Any non-terminal state → `cancelled`

### Review `moderation_status`
`pending → approved | rejected`
