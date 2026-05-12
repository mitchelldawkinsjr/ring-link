<?php

declare(strict_types=1);

namespace App\Actions\Submissions;

use App\Enums\SubmissionStatus;
use App\Models\Event;
use App\Models\Submission;
use App\Models\WrestlerProfile;
use Illuminate\Validation\ValidationException;

final class CreateSubmissionAction
{
    public function execute(Event $event, WrestlerProfile $wrestlerProfile, ?string $note): Submission
    {
        $exists = Submission::query()
            ->where('event_id', $event->id)
            ->where('wrestler_profile_id', $wrestlerProfile->id)
            ->exists();
        if ($exists) {
            throw ValidationException::withMessages([
                'event_id' => ['You already submitted to this event.'],
            ]);
        }

        return Submission::query()->create([
            'event_id' => $event->id,
            'wrestler_profile_id' => $wrestlerProfile->id,
            'status' => SubmissionStatus::Submitted,
            'note' => $note,
        ]);
    }
}
