<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\BookingStatus;
use App\Enums\SubmissionStatus;
use App\Enums\UserRole;
use App\Models\AvailabilityWindow;
use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Event;
use App\Models\MediaLink;
use App\Models\Message;
use App\Models\PromotionProfile;
use App\Models\Submission;
use App\Models\User;
use App\Models\VerifiedBookingReview;
use App\Models\WrestlerProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed a small, hand-curated demo set for the public site.
     *
     *  - 3 wrestlers with reputations + availability
     *  - 2 promotions with venues and shows
     *  - submissions / bookings spanning several workflow states
     *  - verified reviews with full 6-dimension ratings
     *  - threaded conversations between paired counterparties
     *
     * Idempotent: uses firstOrCreate / updateOrCreate keyed on email / FKs
     * so re-running tops up missing rows without producing duplicates.
     *
     * Demo accounts always use the `@ringlink.local` email domain; any old
     * demo accounts on that domain that are NOT in the curated catalog below
     * are pruned at the end of the run, so the live site stays tidy.
     */
    public function run(): void
    {
        $wrestlers = $this->seedWrestlers();
        $promotions = $this->seedPromotions();
        $events = $this->seedEvents($promotions);
        $this->seedAvailability($wrestlers);
        $this->seedDemoVideos($wrestlers);
        $submissions = $this->seedSubmissions($events, $wrestlers);
        $bookings = $this->seedBookings($submissions);
        $this->seedReviews($bookings);
        $this->seedConversations($bookings);
        $this->pruneStaleDemoAccounts();
        $this->recalculateWrestlerRatings();

        $this->command?->info('Demo data ready: '
            .count($wrestlers).' wrestlers, '
            .count($promotions).' promotions, '
            .count($events).' events, '
            .count($bookings).' bookings.');
    }

    /**
     * Curated wrestler emails (the only `@ringlink.local` wrestler users that
     * should exist after a seed run).
     *
     * @return array<int, string>
     */
    private function curatedWrestlerEmails(): array
    {
        return array_column($this->wrestlerCatalog(), 1);
    }

    /**
     * Curated promotion emails (the only `@ringlink.local` promotion users that
     * should exist after a seed run).
     *
     * @return array<int, string>
     */
    private function curatedPromotionEmails(): array
    {
        return array_column($this->promotionCatalog(), 1);
    }

    /**
     * @return array<int, array{0:string,1:string,2:string,3:string,4:string,5:int,6:array<int,string>,7:string,8:int,9:int,10:float,11:string}>
     */
    private function wrestlerCatalog(): array
    {
        // [ringName, email, hometown, state, style, years, matchTypes, gimmick, rateMin, rateMax, rating, imageSlug]
        return [
            ['Alex "The Anvil" Steele', 'alex.steele@ringlink.local', 'Pittsburgh, PA', 'PA', 'technical', 12, ['singles', 'tag', 'hardcore'], 'Iron-fisted blue collar enforcer.', 800, 2500, 4.9, 'alex-steele'],
            ['Siren Storm', 'siren.storm@ringlink.local', 'Brooklyn, NY', 'NY', 'high-flyer', 7, ['singles', 'tag'], 'Lightning-quick high-flying babyface.', 500, 1800, 4.7, 'siren-storm'],
            ['Mistico Volador', 'mistico.volador@ringlink.local', 'Mexico City', 'TX', 'high-flyer', 9, ['singles', 'lucha'], 'Masked luchador with a lethal corkscrew finish.', 600, 2200, 4.6, 'mistico-volador'],
        ];
    }

    /**
     * @return array<int, array{0:string,1:string,2:string,3:string,4:string,5:string}>
     */
    private function promotionCatalog(): array
    {
        // [name, email, city, state, description, imageSlug]
        return [
            ['Apex Combat Wrestling', 'bookings@apexcombat.local', 'Las Vegas', 'NV', 'Premier west-coast independent. Quarterly stadium shows.', 'apex-combat'],
            ['Ironbound Pro Wrestling', 'office@ironbound.local', 'Brooklyn', 'NY', 'East-coast hardcore-leaning indie since 2019.', 'ironbound'],
        ];
    }

    /**
     * @return array<int, WrestlerProfile>
     */
    private function seedWrestlers(): array
    {
        $profiles = [];
        foreach ($this->wrestlerCatalog() as $idx => [$ringName, $email, $hometown, $state, $style, $years, $matchTypes, $gimmick, $rateMin, $rateMax, $rating, $imageSlug]) {
            $user = User::query()->firstOrCreate(
                ['email' => $email],
                [
                    'name' => $ringName,
                    'password' => Hash::make('password'),
                    'role' => UserRole::Wrestler,
                    'email_verified_at' => now(),
                ]
            );

            $profile = WrestlerProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'ring_name' => $ringName,
                    'hometown' => $hometown,
                    'state' => $state,
                    'wrestling_style' => $style,
                    'years_experience' => $years,
                    'match_types' => $matchTypes,
                    'gimmick' => $gimmick,
                    'travel_radius_miles' => 500,
                    'gender_division' => 'open',
                    'booking_rate_min' => $rateMin,
                    'booking_rate_max' => $rateMax,
                    // Stored rating gets recalculated from reviews at end of seed.
                    'average_rating' => $rating,
                    'review_count' => 0,
                    'social_links' => ['twitter' => 'https://twitter.com/'.str_replace([' ', '"', "'"], '', strtolower($ringName))],
                ]
            );

            MediaLink::query()->updateOrCreate(
                [
                    'wrestler_profile_id' => $profile->id,
                    'sort_order' => 0,
                ],
                [
                    'media_type' => 'photo',
                    'url' => $this->frontendAssetUrl("/seed/wrestlers/wrestler-{$imageSlug}.jpg"),
                ]
            );

            $profiles[] = $profile;
        }

        return $profiles;
    }

    /**
     * @return array<int, PromotionProfile>
     */
    private function seedPromotions(): array
    {
        $profiles = [];
        foreach ($this->promotionCatalog() as [$name, $email, $city, $state, $description, $imageSlug]) {
            $user = User::query()->firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'role' => UserRole::Promotion,
                    'email_verified_at' => now(),
                ]
            );

            $profiles[] = PromotionProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'promotion_name' => $name,
                    'city' => $city,
                    'state' => $state,
                    'description' => $description,
                    'branding' => [
                        'accent' => '#d83f2e',
                        'logo_url' => $this->frontendAssetUrl("/seed/promotions/promotion-{$imageSlug}.jpg"),
                    ],
                ]
            );
        }

        return $profiles;
    }

    /**
     * Build an absolute URL for a frontend-hosted demo asset.
     * Prefers FRONTEND_URL but falls back to the local Next dev origin.
     */
    private function frontendAssetUrl(string $path): string
    {
        $base = rtrim((string) (config('app.frontend_url') ?? env('FRONTEND_URL', 'http://localhost:3001')), '/');

        return $base.'/'.ltrim($path, '/');
    }

    /**
     * @param  array<int, PromotionProfile>  $promotions
     * @return array<int, Event>
     */
    private function seedEvents(array $promotions): array
    {
        $catalog = [
            // promotion index => list of [name, +days, venue, city, state]
            0 => [
                ['Winter Warfront', 14, 'Apex Arena', 'Las Vegas', 'NV'],
                ['Genesis: Retribution', 35, 'Apex Arena', 'Las Vegas', 'NV'],
            ],
            1 => [
                ['Steel Cage Carnage', 21, 'Brooklyn Brawl Hall', 'Brooklyn', 'NY'],
            ],
        ];

        $events = [];
        foreach ($catalog as $i => $shows) {
            if (! isset($promotions[$i])) {
                continue;
            }
            foreach ($shows as [$name, $days, $venue, $city, $state]) {
                $events[] = Event::query()->updateOrCreate(
                    [
                        'promotion_profile_id' => $promotions[$i]->id,
                        'name' => $name,
                    ],
                    [
                        'starts_at' => now()->addDays($days)->setTime(20, 0),
                        'venue' => $venue,
                        'city' => $city,
                        'state' => $state,
                    ]
                );
            }
        }

        return $events;
    }

    /**
     * Attach a couple of demo highlight reels to a few wrestlers so the
     * public profile video gallery has content out of the box.
     *
     * @param  array<int, WrestlerProfile>  $wrestlers
     */
    private function seedDemoVideos(array $wrestlers): void
    {
        // Stable, evergreen public clips. We do not own these — they're for demo only.
        $catalog = [
            // wrestler index => list of [media_type, url]
            0 => [
                ['video_youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
            ],
            1 => [
                ['video_youtube', 'https://www.youtube.com/watch?v=jNQXAC9IVRw'],
            ],
            2 => [
                ['video_vimeo', 'https://vimeo.com/76979871'],
            ],
        ];

        foreach ($catalog as $index => $clips) {
            $wrestler = $wrestlers[$index] ?? null;
            if (! $wrestler) {
                continue;
            }
            foreach ($clips as $i => [$type, $url]) {
                MediaLink::query()->updateOrCreate(
                    [
                        'wrestler_profile_id' => $wrestler->id,
                        'url' => $url,
                    ],
                    [
                        'media_type' => $type,
                        'sort_order' => 10 + $i,
                    ]
                );
            }
        }
    }

    /**
     * @param  array<int, WrestlerProfile>  $wrestlers
     */
    private function seedAvailability(array $wrestlers): void
    {
        foreach ($wrestlers as $w) {
            // Two open windows: this month + next month.
            foreach ([0, 30] as $offset) {
                AvailabilityWindow::query()->firstOrCreate(
                    [
                        'wrestler_profile_id' => $w->id,
                        'starts_at' => now()->addDays($offset)->startOfDay(),
                    ],
                    [
                        'ends_at' => now()->addDays($offset + 14)->endOfDay(),
                    ]
                );
            }
        }
    }

    /**
     * @param  array<int, Event>  $events
     * @param  array<int, WrestlerProfile>  $wrestlers
     * @return array<int, Submission>
     */
    private function seedSubmissions(array $events, array $wrestlers): array
    {
        // Curated assignments so every wrestler shows up at least once and
        // every event has at least one submission. Indices map into the
        // smaller 3-wrestler / 3-event catalog.
        $assignments = [
            // [eventIndex, wrestlerIndex, status, note]
            [0, 0, SubmissionStatus::Booked, 'Confirmed for main event slot.'],
            [0, 1, SubmissionStatus::Accepted, 'Available, awaiting contract.'],
            [1, 2, SubmissionStatus::Submitted, 'Pitching a lucha showcase.'],
            [2, 0, SubmissionStatus::Booked, 'Hardcore main event, east coast run.'],
        ];

        $submissions = [];
        foreach ($assignments as [$eventIdx, $wrestlerIdx, $status, $note]) {
            if (! isset($events[$eventIdx], $wrestlers[$wrestlerIdx])) {
                continue;
            }
            $submissions[] = Submission::query()->updateOrCreate(
                [
                    'event_id' => $events[$eventIdx]->id,
                    'wrestler_profile_id' => $wrestlers[$wrestlerIdx]->id,
                ],
                [
                    'status' => $status,
                    'note' => $note,
                ]
            );
        }

        return $submissions;
    }

    /**
     * Create bookings for every "Booked" submission, plus some across statuses.
     *
     * @param  array<int, Submission>  $submissions
     * @return array<int, Booking>
     */
    private function seedBookings(array $submissions): array
    {
        $bookedSubs = array_values(array_filter(
            $submissions,
            fn (Submission $s) => $s->status === SubmissionStatus::Booked
        ));

        // Spread bookings across statuses for realistic dashboards.
        $statusPlan = [
            BookingStatus::Completed,
            BookingStatus::Confirmed,
        ];
        $rates = [150000, 95000];

        $bookings = [];
        foreach ($bookedSubs as $i => $sub) {
            $sub->loadMissing('event');
            $status = $statusPlan[$i % count($statusPlan)];

            $bookedAt = match ($status) {
                BookingStatus::Completed => Carbon::now()->subDays(20 + $i),
                BookingStatus::InProgress => Carbon::now()->subDays(2),
                BookingStatus::Confirmed => Carbon::now()->subDays(7),
                default => Carbon::now()->subHours(36),
            };

            $bookings[] = Booking::query()->updateOrCreate(
                ['submission_id' => $sub->id],
                [
                    'promotion_profile_id' => $sub->event->promotion_profile_id,
                    'wrestler_profile_id' => $sub->wrestler_profile_id,
                    'status' => $status,
                    'fee_cents' => $rates[$i % count($rates)],
                    'booked_at' => $bookedAt,
                ]
            );
        }

        return $bookings;
    }

    /**
     * @param  array<int, Booking>  $bookings
     */
    private function seedReviews(array $bookings): void
    {
        $reviewTexts = [
            'A consummate professional. Hit every spot, pulled a real reaction. Booking again.',
            'Showed up early, helped lay out the match, locker room loved them. Top tier.',
        ];

        $i = 0;
        foreach ($bookings as $booking) {
            if ($booking->status !== BookingStatus::Completed) {
                continue;
            }

            VerifiedBookingReview::query()->updateOrCreate(
                ['booking_id' => $booking->id],
                [
                    'promotion_profile_id' => $booking->promotion_profile_id,
                    'wrestler_profile_id' => $booking->wrestler_profile_id,
                    'overall_rating' => 5,
                    'professionalism_rating' => 5,
                    'communication_rating' => 5,
                    'in_ring_rating' => $i % 2 === 0 ? 5 : 4,
                    'reliability_rating' => 5,
                    'crowd_reaction_rating' => $i % 2 === 0 ? 4 : 5,
                    'review_text' => $reviewTexts[$i % count($reviewTexts)],
                    'moderation_status' => 'approved',
                ]
            );
            $i++;
        }
    }

    /**
     * @param  array<int, Booking>  $bookings
     */
    private function seedConversations(array $bookings): void
    {
        // Open a thread for every confirmed/in-progress/completed booking.
        $messageScript = [
            ['promotion', 'Pumped to have you on the card. Sending the rider over now.'],
            ['wrestler', 'Cheers — got it, will sign by tomorrow. Anything you want me to push pre-show?'],
            ['promotion', 'Run the angle on social with the new gimmick. We will pin it on our channels.'],
            ['wrestler', 'On it. See you at the production meeting.'],
        ];

        foreach ($bookings as $booking) {
            if (! in_array($booking->status, [BookingStatus::Confirmed, BookingStatus::InProgress, BookingStatus::Completed], true)) {
                continue;
            }

            $conv = Conversation::query()->firstOrCreate(
                [
                    'booking_id' => $booking->id,
                ],
                [
                    'promotion_profile_id' => $booking->promotion_profile_id,
                    'wrestler_profile_id' => $booking->wrestler_profile_id,
                ]
            );

            if ($conv->messages()->exists()) {
                continue;
            }

            $promotionUserId = $booking->promotionProfile?->user_id;
            $wrestlerUserId = $booking->wrestlerProfile?->user_id;
            if (! $promotionUserId || ! $wrestlerUserId) {
                continue;
            }

            foreach ($messageScript as $idx => [$role, $body]) {
                $message = Message::query()->create([
                    'conversation_id' => $conv->id,
                    'sender_user_id' => $role === 'promotion' ? $promotionUserId : $wrestlerUserId,
                    'body' => $body,
                ]);
                $message->forceFill([
                    'created_at' => now()->subHours(48 - ($idx * 8)),
                    'updated_at' => now()->subHours(48 - ($idx * 8)),
                ])->save();
            }
        }
    }

    /**
     * Delete any leftover demo accounts (emails on the `@ringlink.local`
     * domain) that are not part of the curated catalog. FKs cascade on
     * user delete, so the profile + media + submissions + bookings +
     * reviews + conversations all disappear in one shot.
     */
    private function pruneStaleDemoAccounts(): void
    {
        $keep = array_merge($this->curatedWrestlerEmails(), $this->curatedPromotionEmails());

        $stale = User::query()
            ->where('email', 'like', '%@ringlink.local')
            ->whereIn('role', [UserRole::Wrestler, UserRole::Promotion])
            ->whereNotIn('email', $keep)
            ->get();

        foreach ($stale as $user) {
            $this->command?->info("Pruning stale demo account: {$user->email}");
            $user->forceDelete();
        }
    }

    private function recalculateWrestlerRatings(): void
    {
        $rows = VerifiedBookingReview::query()
            ->where('moderation_status', 'approved')
            ->get(['wrestler_profile_id', 'overall_rating']);

        $byWrestler = $rows->groupBy('wrestler_profile_id');

        foreach ($byWrestler as $wrestlerId => $reviews) {
            $avg = round($reviews->avg('overall_rating'), 2);
            WrestlerProfile::query()->where('id', $wrestlerId)->update([
                'review_count' => $reviews->count(),
                'average_rating' => $avg,
            ]);
        }
    }
}
