<?php

declare(strict_types=1);

namespace App\Observers;

use App\Actions\Audit\WriteAuditLogAction;
use App\Jobs\SendRinglinkAlertJob;
use App\Models\VerifiedBookingReview;
use Illuminate\Support\Facades\Auth;

final class VerifiedBookingReviewObserver
{
    public function updated(VerifiedBookingReview $review): void
    {
        if (! $review->wasChanged('moderation_status')) {
            return;
        }
        $actor = Auth::user();
        if ($actor) {
            app(WriteAuditLogAction::class)->execute(
                $actor,
                $review,
                'review_moderation_changed',
                (string) $review->getOriginal('moderation_status'),
                $review->moderation_status,
            );
        }

        $review->loadMissing('wrestlerProfile');
        SendRinglinkAlertJob::dispatch(
            $review->wrestlerProfile->user_id,
            'review_moderation',
            ['review_id' => $review->id, 'status' => $review->moderation_status]
        );
    }
}
