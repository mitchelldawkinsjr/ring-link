<?php

declare(strict_types=1);

namespace App\Actions\Reviews;

use App\Enums\BookingStatus;
use App\Jobs\SendRinglinkAlertJob;
use App\Models\Booking;
use App\Models\PromotionProfile;
use App\Models\VerifiedBookingReview;
use Illuminate\Support\Facades\DB;

final class SubmitVerifiedReviewAction
{
    public function execute(
        Booking $booking,
        PromotionProfile $promotionProfile,
        array $ratings,
        ?string $reviewText
    ): VerifiedBookingReview {
        return DB::transaction(function () use ($booking, $promotionProfile, $ratings, $reviewText): VerifiedBookingReview {
            $booking->refresh();
            if ($booking->status !== BookingStatus::Completed) {
                abort(422, 'Booking must be completed before submitting a review.');
            }
            if ($booking->promotion_profile_id !== $promotionProfile->id) {
                abort(403);
            }
            if ($booking->verifiedReview()->exists()) {
                abort(422, 'A review already exists for this booking.');
            }

            $review = VerifiedBookingReview::query()->create([
                'booking_id' => $booking->id,
                'promotion_profile_id' => $promotionProfile->id,
                'wrestler_profile_id' => $booking->wrestler_profile_id,
                'overall_rating' => $ratings['overall_rating'],
                'professionalism_rating' => $ratings['professionalism_rating'],
                'communication_rating' => $ratings['communication_rating'],
                'in_ring_rating' => $ratings['in_ring_rating'],
                'reliability_rating' => $ratings['reliability_rating'],
                'crowd_reaction_rating' => $ratings['crowd_reaction_rating'],
                'review_text' => $reviewText,
                'moderation_status' => 'pending',
            ]);

            SendRinglinkAlertJob::dispatch(
                $booking->wrestlerProfile->user_id,
                'review_submitted',
                ['review_id' => $review->id, 'booking_id' => $booking->id]
            );

            return $review;
        });
    }
}
