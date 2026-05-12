<?php

namespace Database\Factories;

use App\Enums\SubmissionStatus;
use App\Models\Event;
use App\Models\Submission;
use App\Models\WrestlerProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Submission>
 */
class SubmissionFactory extends Factory
{
    protected $model = Submission::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'wrestler_profile_id' => WrestlerProfile::factory(),
            'status' => SubmissionStatus::Submitted,
            'note' => fake()->optional()->sentence(),
        ];
    }
}
