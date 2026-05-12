<?php

namespace Database\Factories;

use App\Models\PromotionProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PromotionProfile>
 */
class PromotionProfileFactory extends Factory
{
    protected $model = PromotionProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->promotion(),
            'promotion_name' => fake()->company().' Wrestling',
            'city' => fake()->city(),
            'state' => fake()->randomElement(['TX', 'FL', 'NY']),
            'description' => fake()->paragraph(),
        ];
    }
}
