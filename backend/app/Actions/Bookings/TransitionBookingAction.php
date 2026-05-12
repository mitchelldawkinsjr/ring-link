<?php

declare(strict_types=1);

namespace App\Actions\Bookings;

use App\Enums\BookingStatus;
use App\Enums\UserRole;
use App\Jobs\SendRinglinkAlertJob;
use App\Models\Booking;
use App\Models\User;
use App\Support\TransitionGuard;
use Illuminate\Support\Facades\DB;

final class TransitionBookingAction
{
    public function execute(Booking $booking, BookingStatus $to, User $actor): Booking
    {
        return DB::transaction(function () use ($booking, $to, $actor): Booking {
            $booking->refresh();
            $from = $booking->status;
            $fromValue = $from->value;
            $toValue = $to->value;

            if ($toValue === 'cancelled') {
                if (! in_array($actor->role, [UserRole::Promotion, UserRole::Wrestler, UserRole::Admin], true)) {
                    abort(403);
                }
            } elseif ($actor->role === UserRole::Wrestler) {
                abort(403, 'Only promotions may advance booking status.');
            }

            TransitionGuard::assertBooking($fromValue, $toValue);

            if ($to === BookingStatus::Confirmed && $booking->booked_at === null) {
                $booking->booked_at = now();
            }

            $booking->status = $to;
            $booking->save();

            $booking->load('promotionProfile.user', 'wrestlerProfile.user');
            $recipientIds = [
                $booking->promotionProfile->user_id,
                $booking->wrestlerProfile->user_id,
            ];
            foreach ($recipientIds as $uid) {
                SendRinglinkAlertJob::dispatch(
                    (int) $uid,
                    'booking_status_changed',
                    ['booking_id' => $booking->id, 'status' => $toValue]
                );
            }

            return $booking->fresh();
        });
    }
}
