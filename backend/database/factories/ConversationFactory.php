<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Conversation;
use App\Models\PromotionProfile;
use App\Models\WrestlerProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'wrestler_profile_id' => null,
            'promotion_profile_id' => null,
        ];
    }

    public function forPreBooking(WrestlerProfile $w, PromotionProfile $p): static
    {
        return $this->state(fn () => [
            'booking_id' => null,
            'wrestler_profile_id' => $w->id,
            'promotion_profile_id' => $p->id,
        ]);
    }
}
