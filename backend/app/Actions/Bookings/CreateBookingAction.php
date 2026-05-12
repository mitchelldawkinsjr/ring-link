<?php

declare(strict_types=1);

namespace App\Actions\Bookings;

use App\Enums\BookingStatus;
use App\Enums\SubmissionStatus;
use App\Models\Booking;
use App\Models\Submission;
use Illuminate\Support\Facades\DB;

final class CreateBookingAction
{
    public function execute(Submission $submission, ?int $feeCents): Booking
    {
        return DB::transaction(function () use ($submission, $feeCents): Booking {
            $submission->refresh();
            if ($submission->status !== SubmissionStatus::Accepted) {
                abort(422, 'Submission must be accepted before creating a booking.');
            }
            if ($submission->booking()->exists()) {
                abort(422, 'A booking already exists for this submission.');
            }

            $booking = Booking::query()->create([
                'submission_id' => $submission->id,
                'promotion_profile_id' => $submission->event->promotion_profile_id,
                'wrestler_profile_id' => $submission->wrestler_profile_id,
                'status' => BookingStatus::Pending,
                'fee_cents' => $feeCents,
            ]);

            $submission->update(['status' => SubmissionStatus::Booked]);

            return $booking->fresh();
        });
    }
}
