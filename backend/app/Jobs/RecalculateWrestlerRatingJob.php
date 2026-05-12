<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\VerifiedBookingReview;
use App\Models\WrestlerProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class RecalculateWrestlerRatingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $wrestlerProfileId) {}

    public function handle(): void
    {
        $query = VerifiedBookingReview::query()
            ->where('wrestler_profile_id', $this->wrestlerProfileId)
            ->where('moderation_status', 'approved');

        $count = (clone $query)->count();
        $avg = (clone $query)->avg('overall_rating');

        WrestlerProfile::query()->whereKey($this->wrestlerProfileId)->update([
            'review_count' => $count,
            'average_rating' => round((float) ($avg ?? 0), 2),
        ]);
    }
}
