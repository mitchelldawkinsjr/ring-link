<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\PromotionProfile;
use App\Models\User;

class PromotionProfilePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, PromotionProfile $promotionProfile): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::Promotion && $user->promotionProfile === null;
    }

    public function update(User $user, PromotionProfile $promotionProfile): bool
    {
        return $user->role === UserRole::Promotion && $user->id === $promotionProfile->user_id;
    }
}
