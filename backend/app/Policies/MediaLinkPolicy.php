<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\MediaLink;
use App\Models\User;

class MediaLinkPolicy
{
    public function manage(User $user, MediaLink $mediaLink): bool
    {
        return $user->role === UserRole::Wrestler
            && $user->wrestlerProfile?->id === $mediaLink->wrestler_profile_id;
    }
}
