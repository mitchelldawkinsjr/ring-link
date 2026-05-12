<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Submission;
use App\Models\User;

class SubmissionPolicy
{
    public function create(User $user): bool
    {
        return $user->role === UserRole::Wrestler && $user->wrestlerProfile !== null;
    }

    public function view(User $user, Submission $submission): bool
    {
        if ($user->role === UserRole::Admin) {
            return true;
        }
        if ($user->role === UserRole::Wrestler && $user->wrestlerProfile?->id === $submission->wrestler_profile_id) {
            return true;
        }
        if ($user->role === UserRole::Promotion && $user->promotionProfile?->id === $submission->event->promotion_profile_id) {
            return true;
        }

        return false;
    }

    public function transition(User $user, Submission $submission): bool
    {
        if ($user->role === UserRole::Admin) {
            return true;
        }
        if ($user->role === UserRole::Promotion && $user->promotionProfile?->id === $submission->event->promotion_profile_id) {
            return true;
        }
        if ($user->role === UserRole::Wrestler && $user->wrestlerProfile?->id === $submission->wrestler_profile_id) {
            return true;
        }

        return false;
    }
}
