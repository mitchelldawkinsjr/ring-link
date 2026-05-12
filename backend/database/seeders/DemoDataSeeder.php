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
     * Seed a hand-curated, realistic demo dataset:
     *  - 8 wrestlers with reputations and availability
     *  - 4 promotions with venues and shows
     *  - submissions / bookings spanning every workflow state
     *  - verified reviews with full 6-dimension ratings
     *  - threaded conversations between paired counterparties
     *
     * Idempotent: uses firstOrCreate keyed on email / FKs so re-running
     * top-ups missing rows without producing duplicates.
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
        $this->recalculateWrestlerRatings();

        $this->command?->info('Demo data ready: '
            .count($wrestlers).' wrestlers, '
            .count($promotions).' promotions, '
            .count($events).' events, '
            .count($bookings).' bookings.');
    }

    /**
     * @return array<int, WrestlerProfile>
     */
    private function seedWrestlers(): array
    {
        $rows = [
            // [ringName, email, hometown, state, style, years, matchTypes, gimmick, rateMin, rateMax, rating, imageSlug]
            ['Alex "The Anvil" Steele', 'alex.steele@ringlink.local', 'Pittsburgh, PA', 'PA', 'technical', 12, ['singles', 'tag', 'hardcore'], 'Iron-fisted blue collar enforcer.', 800, 2500, 4.9, 'alex-steele'],
            ['Siren Storm', 'siren.storm@ringlink.local', 'Brooklyn, NY', 'NY', 'high-flyer', 7, ['singles', 'tag'], 'Lightning-quick high-flying babyface.', 500, 1800, 4.7, 'siren-storm'],
            ['Mistico Volador', 'mistico.volador@ringlink.local', 'Mexico City', 'TX', 'high-flyer', 9, ['singles', 'lucha'], 'Masked luchador with a lethal corkscrew finish.', 600, 2200, 4.6, 'mistico-volador'],
            ['Brick Calloway', 'brick.calloway@ringlink.local', 'Houston, TX', 'TX', 'brawler', 14, ['singles', 'hardcore'], 'Old-school southern brawler. Will bleed for the show.', 700, 2300, 4.4, 'brick-calloway'],
            ['Nyx Kasai', 'nyx.kasai@ringlink.local', 'Tokyo, JP', 'CA', 'technical', 6, ['singles', 'joshi'], 'Strong-style submission specialist.', 550, 1900, 4.8, 'nyx-kasai'],
            ['Rex "The Ripper" Holloway', 'rex.holloway@ringlink.local', 'Tampa, FL', 'FL', 'brawler', 11, ['singles', 'tag', 'hardcore'], 'Bruiser with a championship pedigree.', 750, 2400, 4.5, 'rex-holloway'],
            ['Eulogy Vex', 'eulogy.vex@ringlink.local', 'Cleveland, OH', 'OH', 'technical', 4, ['singles'], 'Up-and-coming technical phenom.', 350, 1200, 4.3, 'eulogy-vex'],
            ['Phoenix LaRue', 'phoenix.larue@ringlink.local', 'Los Angeles, CA', 'CA', 'high-flyer', 8, ['singles', 'tag'], 'Charismatic crowd favourite. Sells like nobody else.', 600, 2100, 4.7, 'phoenix-larue'],
        ];

        $profiles = [];
        foreach ($rows as [$ringName, $email, $hometown, $state, $style, $years, $matchTypes, $gimmick, $rateMin, $rateMax, $rating, $imageSlug]) {
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

            $imageUrl = $this->frontendAssetUrl("/seed/wrestlers/wrestler-{$imageSlug}.jpg");
            MediaLink::query()->updateOrCreate(
                [
                    'wrestler_profile_id' => $profile->id,
                    'sort_order' => 0,
                ],
                [
                    'media_type' => 'photo',
                    'url' => $imageUrl,
                ]
            );

            // Second hero photo for a few demo profiles so the public carousel is visible.
            $gallerySecond = [
                0 => 'rex-holloway',
                1 => 'nyx-kasai',
                2 => 'brick-calloway',
            ];
            if (isset($gallerySecond[count($profiles)])) {
                MediaLink::query()->updateOrCreate(
                    [
                        'wrestler_profile_id' => $profile->id,
                        'sort_order' => 1,
                    ],
                    [
                        'media_type' => 'photo',
                        'url' => $this->frontendAssetUrl('/seed/wrestlers/wrestler-'.$gallerySecond[count($profiles)].'.jpg'),
                    ]
                );
            }

            $profiles[] = $profile;
        }

        return $profiles;
    }

    /**
     * @return array<int, PromotionProfile>
     */
    private function seedPromotions(): array
    {
        $rows = [
            // [name, email, city, state, description, imageSlug]
            ['Apex Combat Wrestling', 'bookings@apexcombat.local', 'Las Vegas', 'NV', 'Premier west-coast independent. Quarterly stadium shows.', 'apex-combat'],
            ['Ironbound Pro Wrestling', 'office@ironbound.local', 'Brooklyn', 'NY', 'East-coast hardcore-leaning indie since 2019.', 'ironbound'],
            ['Lone Star Throwdown', 'staff@lonestar.local', 'Austin', 'TX', 'Texas-based southern style promotion.', 'lone-star'],
            ['Nexus Global Wrestling', 'nexus@nexusgw.local', 'Chicago', 'IL', 'Midwest-grown promotion with TV distribution deals.', 'nexus'],
        ];

        $profiles = [];
        foreach ($rows as [$name, $email, $city, $state, $description, $imageSlug]) {
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
                ['Mojave Mayhem', 60, 'Sandstorm Auditorium', 'Phoenix', 'AZ'],
            ],
            1 => [
                ['Steel Cage Carnage', 21, 'Brooklyn Brawl Hall', 'Brooklyn', 'NY'],
                ['Ironbound Anniversary', 49, 'Iron Forge Arena', 'Newark', 'NJ'],
            ],
            2 => [
                ['Texas Turmoil', 18, 'Lone Star Coliseum', 'Austin', 'TX'],
                ['Bourbon &amp; Brass', 42, 'Bayou Arena', 'New Orleans', 'LA'],
            ],
            3 => [
                ['Nexus Showdown', 28, 'Midwest Dome', 'Chicago', 'IL'],
                ['Heartland Heatwave', 70, 'Heartland Field House', 'Indianapolis', 'IN'],
            ],
        ];

        $events = [];
        foreach ($catalog as $i => $shows) {
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
                ['video_youtube', 'https://www.youtube.com/watch?v=9bZkp7q19f0'],
            ],
            1 => [
                ['video_youtube', 'https://www.youtube.com/watch?v=jNQXAC9IVRw'],
            ],
            2 => [
                ['video_vimeo', 'https://vimeo.com/76979871'],
            ],
            5 => [
                ['video_youtube', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'],
            ],
            7 => [
                ['video_youtube', 'https://www.youtube.com/watch?v=hT_nvWreIhg'],
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
        // Curated assignments so the same wrestler can show up across multiple promotions.
        $assignments = [
            // [eventIndex, wrestlerIndex, status, note]
            [0, 0, SubmissionStatus::Booked, 'Confirmed for main event slot.'],
            [0, 1, SubmissionStatus::Accepted, 'Available, awaiting contract.'],
            [0, 4, SubmissionStatus::Submitted, 'Open to a tag spot.'],
            [1, 5, SubmissionStatus::Booked, 'Locked in, hardcore match.'],
            [1, 7, SubmissionStatus::Submitted, 'Pitching a Phoenix vs Storm angle.'],
            [2, 3, SubmissionStatus::OfferSent, 'Holding date, finalising rate.'],
            [3, 2, SubmissionStatus::Booked, 'Lucha showcase confirmed.'],
            [4, 6, SubmissionStatus::Submitted, 'First-time submission to Ironbound.'],
            [5, 0, SubmissionStatus::Booked, 'Top guy back home in Texas.'],
            [6, 7, SubmissionStatus::Reviewing, 'Promotion still finalising card.'],
            [7, 4, SubmissionStatus::Booked, 'Strong-style spotlight match.'],
            [8, 1, SubmissionStatus::Submitted, 'Trying out Heartland route.'],
        ];

        $submissions = [];
        foreach ($assignments as [$eventIdx, $wrestlerIdx, $status, $note]) {
            $sub = Submission::query()->updateOrCreate(
                [
                    'event_id' => $events[$eventIdx]->id,
                    'wrestler_profile_id' => $wrestlers[$wrestlerIdx]->id,
                ],
                [
                    'status' => $status,
                    'note' => $note,
                ]
            );
            $submissions[] = $sub;
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
            BookingStatus::Completed,
            BookingStatus::InProgress,
            BookingStatus::Confirmed,
            BookingStatus::Pending,
        ];
        $rates = [120000, 150000, 180000, 95000, 220000];

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
            'Crowd ate it up. Solid mic work, sharp psychology. Would headline again without hesitation.',
            'Reliable from contract to bell. Big asset for the card.',
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

            // Skip if we already populated messages.
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
