<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\PromotionProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        return [
            'promotion_profile_id' => PromotionProfile::factory(),
            'name' => fake()->words(3, true).' Show',
            'starts_at' => fake()->dateTimeBetween('+1 week', '+2 months'),
            'venue' => fake()->company().' Arena',
            'city' => fake()->city(),
            'state' => 'TX',
        ];
    }
}
