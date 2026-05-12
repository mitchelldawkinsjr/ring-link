<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function view(User $user, Event $event): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::Promotion && $user->promotionProfile !== null;
    }

    public function update(User $user, Event $event): bool
    {
        return $user->role === UserRole::Promotion
            && $user->promotionProfile?->id === $event->promotion_profile_id;
    }

    public function delete(User $user, Event $event): bool
    {
        return $this->update($user, $event);
    }
}
