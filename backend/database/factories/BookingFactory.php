<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Submission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        return [
            'status' => BookingStatus::Pending,
            'fee_cents' => 50_000,
        ];
    }

    public function configure(): static
    {
        return $this->for(Submission::factory())->afterMaking(function (Booking $booking): void {
            $sub = Submission::query()->with('event')->find($booking->submission_id);
            if ($sub !== null) {
                $booking->promotion_profile_id = $sub->event->promotion_profile_id;
                $booking->wrestler_profile_id = $sub->wrestler_profile_id;
            }
        });
    }
}
