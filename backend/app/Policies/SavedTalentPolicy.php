<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\SavedTalent;
use App\Models\User;

class SavedTalentPolicy
{
    public function manage(User $user, SavedTalent $savedTalent): bool
    {
        return $user->role === UserRole::Promotion
            && $user->promotionProfile?->id === $savedTalent->promotion_profile_id;
    }
}
