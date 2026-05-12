<?php

declare(strict_types=1);

use App\Enums\BookingStatus;
use App\Enums\SubmissionStatus;
use App\Models\MediaLink;
use App\Models\User;
use App\Models\VerifiedBookingReview;
use Illuminate\Support\Facades\Mail;

beforeEach(function (): void {
    Mail::fake();
});

test('wrestler and promotion can complete booking and review flow', function (): void {
    $promoUser = User::factory()->promotion()->create();
    $promoUser->promotionProfile()->create([
        'promotion_name' => 'Test Fed',
        'city' => 'Austin',
        'state' => 'TX',
    ]);

    $wrestlerUser = User::factory()->wrestler()->create();
    $wrestlerUser->wrestlerProfile()->create([
        'ring_name' => 'Test Wrestler',
        'state' => 'TX',
        'wrestling_style' => 'technical',
        'years_experience' => 5,
        'review_count' => 0,
        'average_rating' => 0,
    ]);

    $admin = User::factory()->admin()->create();

    $this->actingAs($promoUser, 'sanctum');
    $eventRes = $this->postJson('/api/v1/promotion/events', [
        'name' => 'Summer Bash',
        'starts_at' => now()->addMonth()->toIso8601String(),
        'venue' => 'Arena',
        'city' => 'Dallas',
        'state' => 'TX',
    ]);
    $eventRes->assertCreated();
    $eventId = $eventRes->json('data.id');

    $this->actingAs($wrestlerUser, 'sanctum');
    $subRes = $this->postJson('/api/v1/submissions', [
        'event_id' => $eventId,
        'note' => 'Available',
    ]);
    $subRes->assertCreated();
    $submissionId = $subRes->json('data.id');

    $this->actingAs($promoUser, 'sanctum');
    foreach ([SubmissionStatus::Reviewing, SubmissionStatus::Interested, SubmissionStatus::OfferSent] as $status) {
        $this->patchJson("/api/v1/submissions/{$submissionId}/status", [
            'status' => $status->value,
        ])->assertOk();
    }

    $this->actingAs($wrestlerUser, 'sanctum');
    $this->patchJson("/api/v1/submissions/{$submissionId}/status", [
        'status' => SubmissionStatus::Accepted->value,
    ])->assertOk();

    $this->actingAs($promoUser, 'sanctum');
    $bookRes = $this->postJson('/api/v1/bookings', [
        'submission_id' => $submissionId,
        'fee_cents' => 10000,
    ]);
    $bookRes->assertCreated();
    $bookingId = $bookRes->json('data.id');

    foreach ([BookingStatus::Confirmed, BookingStatus::InProgress, BookingStatus::Completed] as $status) {
        $this->patchJson("/api/v1/bookings/{$bookingId}/status", [
            'status' => $status->value,
        ])->assertOk();
    }

    $this->postJson('/api/v1/reviews', [
        'booking_id' => $bookingId,
        'overall_rating' => 5,
        'professionalism_rating' => 5,
        'communication_rating' => 5,
        'in_ring_rating' => 5,
        'reliability_rating' => 5,
        'crowd_reaction_rating' => 5,
        'review_text' => 'Great talent.',
    ])->assertCreated();

    $reviewId = VerifiedBookingReview::query()->where('booking_id', $bookingId)->value('id');

    $this->actingAs($admin, 'sanctum');
    $this->patchJson("/api/v1/reviews/{$reviewId}/moderation", [
        'moderation_status' => 'approved',
    ])->assertOk();

    $wrestlerUser->wrestlerProfile->refresh();
    expect($wrestlerUser->wrestlerProfile->review_count)->toBe(1)
        ->and((float) $wrestlerUser->wrestlerProfile->average_rating)->toBe(5.0);
});

test('illegal submission transition returns 422', function (): void {
    $promoUser = User::factory()->promotion()->create();
    $promoUser->promotionProfile()->create([
        'promotion_name' => 'Fed',
        'state' => 'TX',
    ]);
    $wrestlerUser = User::factory()->wrestler()->create();
    $wrestlerUser->wrestlerProfile()->create([
        'ring_name' => 'W',
        'state' => 'TX',
        'review_count' => 0,
        'average_rating' => 0,
    ]);

    $this->actingAs($promoUser, 'sanctum');
    $eventId = $this->postJson('/api/v1/promotion/events', [
        'name' => 'Show',
        'starts_at' => now()->addWeek()->toIso8601String(),
    ])->json('data.id');

    $this->actingAs($wrestlerUser, 'sanctum');
    $submissionId = $this->postJson('/api/v1/submissions', ['event_id' => $eventId])->json('data.id');

    $this->actingAs($promoUser, 'sanctum');
    $this->patchJson("/api/v1/submissions/{$submissionId}/status", [
        'status' => SubmissionStatus::Booked->value,
    ])->assertStatus(422);
});

test('media confirm creates link for wrestler', function (): void {
    $u = User::factory()->wrestler()->create();
    $u->wrestlerProfile()->create([
        'ring_name' => 'Media Test',
        'review_count' => 0,
        'average_rating' => 0,
    ]);

    $this->actingAs($u, 'sanctum');
    $this->postJson('/api/v1/media/confirm', [
        'url' => 'https://example.com/vid.mp4',
        'media_type' => 'highlight',
    ])->assertCreated();

    expect(MediaLink::query()->count())->toBe(1);
});
