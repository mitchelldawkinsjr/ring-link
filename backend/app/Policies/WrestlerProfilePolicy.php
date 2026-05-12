<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\WrestlerProfile;

class WrestlerProfilePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, WrestlerProfile $wrestlerProfile): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::Wrestler && $user->wrestlerProfile === null;
    }

    public function update(User $user, WrestlerProfile $wrestlerProfile): bool
    {
        return $user->role === UserRole::Wrestler && $user->id === $wrestlerProfile->user_id;
    }

    public function delete(User $user, WrestlerProfile $wrestlerProfile): bool
    {
        return $this->update($user, $wrestlerProfile);
    }
}
