<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\VerifiedBookingReview;

class VerifiedBookingReviewPolicy
{
    public function create(User $user): bool
    {
        return $user->role === UserRole::Promotion && $user->promotionProfile !== null;
    }

    public function moderate(User $user, VerifiedBookingReview $review): bool
    {
        return $user->role === UserRole::Admin;
    }
}
