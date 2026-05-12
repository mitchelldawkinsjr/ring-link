<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Reviews\ModerateReviewAction;
use App\Actions\Reviews\SubmitVerifiedReviewAction;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\Booking;
use App\Models\VerifiedBookingReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ReviewController extends Controller
{
    public function store(Request $request, SubmitVerifiedReviewAction $action): JsonResponse
    {
        $this->authorize('create', VerifiedBookingReview::class);
        $promotion = $request->user()->promotionProfile;
        abort_if(! $promotion, 403);

        $data = $request->validate([
            'booking_id' => ['required', 'exists:bookings,id'],
            'overall_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'professionalism_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'communication_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'in_ring_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'reliability_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'crowd_reaction_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review_text' => ['nullable', 'string'],
        ]);

        $booking = Booking::query()->findOrFail($data['booking_id']);
        $ratings = collect($data)->only([
            'overall_rating', 'professionalism_rating', 'communication_rating',
            'in_ring_rating', 'reliability_rating', 'crowd_reaction_rating',
        ])->all();

        $review = $action->execute($booking, $promotion, $ratings, $data['review_text'] ?? null);

        return ApiEnvelope::json($this->transform($review), [], 'Created', 201);
    }

    public function moderate(Request $request, VerifiedBookingReview $verifiedBookingReview, ModerateReviewAction $action): JsonResponse
    {
        $this->authorize('moderate', $verifiedBookingReview);
        $data = $request->validate([
            'moderation_status' => ['required', 'in:pending,approved,rejected'],
        ]);
        $verifiedBookingReview = $action->execute($verifiedBookingReview, $data['moderation_status']);

        return ApiEnvelope::json($this->transform($verifiedBookingReview));
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(VerifiedBookingReview $r): array
    {
        return [
            'id' => $r->id,
            'booking_id' => $r->booking_id,
            'promotion_profile_id' => $r->promotion_profile_id,
            'wrestler_profile_id' => $r->wrestler_profile_id,
            'overall_rating' => $r->overall_rating,
            'professionalism_rating' => $r->professionalism_rating,
            'communication_rating' => $r->communication_rating,
            'in_ring_rating' => $r->in_ring_rating,
            'reliability_rating' => $r->reliability_rating,
            'crowd_reaction_rating' => $r->crowd_reaction_rating,
            'review_text' => $r->review_text,
            'moderation_status' => $r->moderation_status,
        ];
    }
}
