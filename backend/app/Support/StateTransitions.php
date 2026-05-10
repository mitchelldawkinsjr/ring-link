<?php

declare(strict_types=1);

namespace App\Support;

final class StateTransitions
{
    public static function submission(): array
    {
        return [
            'submitted' => ['reviewing', 'declined', 'cancelled'],
            'reviewing' => ['interested', 'declined', 'cancelled'],
            'interested' => ['offer_sent', 'declined', 'cancelled'],
            'offer_sent' => ['accepted', 'declined', 'cancelled'],
            'accepted' => ['booked', 'cancelled'],
            'booked' => ['completed', 'cancelled'],
            'declined' => [],
            'completed' => [],
            'cancelled' => [],
        ];
    }

    public static function booking(): array
    {
        return [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['in_progress', 'cancelled'],
            'in_progress' => ['completed', 'cancelled'],
            'completed' => [],
            'cancelled' => [],
        ];
    }
}
