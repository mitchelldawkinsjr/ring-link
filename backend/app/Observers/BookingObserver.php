<?php

declare(strict_types=1);

namespace App\Observers;

use App\Actions\Audit\WriteAuditLogAction;
use App\Models\Booking;
use Illuminate\Support\Facades\Auth;

final class BookingObserver
{
    public function updated(Booking $booking): void
    {
        if (! $booking->wasChanged('status')) {
            return;
        }
        $actor = Auth::user();
        if (! $actor) {
            return;
        }
        app(WriteAuditLogAction::class)->execute(
            $actor,
            $booking,
            'booking_status_changed',
            (string) $booking->getRawOriginal('status'),
            $booking->status->value,
        );
    }
}
