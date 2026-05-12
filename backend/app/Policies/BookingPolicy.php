<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function create(User $user): bool
    {
        return $user->role === UserRole::Promotion && $user->promotionProfile !== null;
    }

    public function view(User $user, Booking $booking): bool
    {
        if ($user->role === UserRole::Admin) {
            return true;
        }
        if ($user->role === UserRole::Wrestler && $user->wrestlerProfile?->id === $booking->wrestler_profile_id) {
            return true;
        }
        if ($user->role === UserRole::Promotion && $user->promotionProfile?->id === $booking->promotion_profile_id) {
            return true;
        }

        return false;
    }

    public function transition(User $user, Booking $booking): bool
    {
        return $this->view($user, $booking);
    }
}
