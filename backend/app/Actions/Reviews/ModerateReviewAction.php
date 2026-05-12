<?php

declare(strict_types=1);

namespace App\Actions\Reviews;

use App\Jobs\RecalculateWrestlerRatingJob;
use App\Models\VerifiedBookingReview;
use Illuminate\Support\Facades\DB;

final class ModerateReviewAction
{
    public function execute(VerifiedBookingReview $review, string $moderationStatus): VerifiedBookingReview
    {
        return DB::transaction(function () use ($review, $moderationStatus): VerifiedBookingReview {
            if (! in_array($moderationStatus, ['approved', 'rejected', 'pending'], true)) {
                abort(422, 'Invalid moderation status.');
            }
            $review->update(['moderation_status' => $moderationStatus]);

            if ($moderationStatus === 'approved') {
                RecalculateWrestlerRatingJob::dispatch($review->wrestler_profile_id);
            }

            return $review->fresh();
        });
    }
}
