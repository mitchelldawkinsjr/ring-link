<?php

declare(strict_types=1);

namespace App\Support;

use App\Exceptions\InvalidStateTransitionException;

final class TransitionGuard
{
    public static function assertSubmission(string $from, string $to): void
    {
        $map = StateTransitions::submission();
        $allowed = $map[$from] ?? [];
        if (! in_array($to, $allowed, true)) {
            throw new InvalidStateTransitionException("Invalid submission transition from {$from} to {$to}.");
        }
    }

    public static function assertBooking(string $from, string $to): void
    {
        $map = StateTransitions::booking();
        $allowed = $map[$from] ?? [];
        if (! in_array($to, $allowed, true)) {
            throw new InvalidStateTransitionException("Invalid booking transition from {$from} to {$to}.");
        }
    }
}
