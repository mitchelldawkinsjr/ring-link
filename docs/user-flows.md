# User Flows

## Wrestler Flow

```
1. Register
   POST /auth/register  { role: "wrestler", name, email, password }
   → receives Sanctum token

2. Create profile
   POST /wrestlers  { ring_name, state, wrestling_style, booking_rate_min/max, ... }

3. Upload media
   POST /media/upload-intent  → signed R2 URL
   → client uploads file directly to R2
   POST /media/confirm  → creates MediaLink record
   PATCH /wrestlers/{id}/media/order  (optional reorder)

4. Set availability
   POST /wrestlers/availability  { windows: [{ starts_at, ends_at }, ...] }

5. Discover events / submit interest
   GET /promotions  → find a promotion
   GET /promotion/events  (when authenticated)
   POST /submissions  { event_id, note }
   → submission status begins as "submitted"

6. Track submission progress
   Status transitions driven by promotion:
   submitted → reviewing → interested → offer_sent → accepted → booked → completed

7. Booking confirmed
   When submission reaches "accepted", a Booking is created by the promotion.
   POST /bookings  → status starts as "pending"
   Promotion transitions: pending → confirmed → in_progress → completed

8. Messaging
   GET /conversations  → list threads linked to bookings
   GET /conversations/{id}/messages
   POST /conversations/{id}/messages  { body }
   PATCH /messages/{id}/read

9. Receive verified review
   After booking is completed, promotion submits a review.
   Review approved by admin → average_rating on wrestler profile recalculated.
```

---

## Promotion Flow

```
1. Register
   POST /auth/register  { role: "promotion", name, email, password }
   → receives Sanctum token

2. Create promotion profile
   POST /promotions  { promotion_name, city, state, description, branding }

3. Create events
   POST /promotion/events  { name, starts_at, venue, city, state }
   PATCH /promotion/events/{id}  (update details)
   DELETE /promotion/events/{id}  (cancel)

4. Discover / save talent
   GET /wrestlers  with filters (state, style, rate, availability)
   POST /promotion/saved-talent/{wrestlerProfile}  (shortlist)
   GET /promotion/saved-talent  (view shortlist)
   DELETE /promotion/saved-talent/{wrestlerProfile}  (remove)

5. Manage submissions
   Wrestlers submit to your events automatically appear as "submitted".
   PATCH /submissions/{id}/status  to move through:
   submitted → reviewing → interested → offer_sent → accepted / declined / cancelled

6. Create booking
   When submission reaches "accepted":
   POST /bookings  { submission_id, fee_cents, booked_at }
   PATCH /bookings/{id}/status  to progress:
   pending → confirmed → in_progress → completed

7. Message the wrestler
   POST /conversations  { booking_id }
   POST /conversations/{id}/messages  { body }

8. Submit verified review
   After booking reaches "completed":
   POST /reviews  {
     booking_id,
     overall_rating, professionalism_rating, communication_rating,
     in_ring_rating, reliability_rating, crowd_reaction_rating,
     review_text
   }
   → review enters "pending" moderation queue
```

---

## Admin Flow

```
1. Login as admin user
   POST /auth/login

2. Moderate reviews
   PATCH /reviews/{id}/moderation  { moderation_status: "approved" | "rejected" }
   → approved reviews trigger wrestler rating recalculation
```
