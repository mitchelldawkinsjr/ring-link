<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WrestlerProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WrestlerProfile>
 */
class WrestlerProfileFactory extends Factory
{
    protected $model = WrestlerProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->wrestler(),
            'ring_name' => fake()->name(),
            'hometown' => fake()->city(),
            'state' => fake()->randomElement(['TX', 'FL', 'NY', 'CA', 'OH']),
            'wrestling_style' => fake()->randomElement(['technical', 'high-flyer', 'brawler']),
            'years_experience' => fake()->numberBetween(1, 20),
            'gender_division' => 'open',
            'booking_rate_min' => 200,
            'booking_rate_max' => 800,
            'review_count' => 0,
            'average_rating' => 0,
        ];
    }
}
