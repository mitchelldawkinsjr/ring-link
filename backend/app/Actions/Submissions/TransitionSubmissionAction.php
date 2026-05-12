<?php

declare(strict_types=1);

namespace App\Actions\Submissions;

use App\Enums\SubmissionStatus;
use App\Enums\UserRole;
use App\Models\Submission;
use App\Models\User;
use App\Support\TransitionGuard;
use Illuminate\Support\Facades\DB;

final class TransitionSubmissionAction
{
    public function execute(Submission $submission, SubmissionStatus $to, User $actor): Submission
    {
        return DB::transaction(function () use ($submission, $to, $actor): Submission {
            $submission->refresh();
            $from = $submission->status;
            $fromValue = $from->value;
            $toValue = $to->value;

            if ($actor->role === UserRole::Wrestler) {
                $allowedWrestler = false;
                if ($toValue === 'cancelled' && ! in_array($fromValue, ['declined', 'completed', 'cancelled'], true)) {
                    $allowedWrestler = true;
                }
                if ($fromValue === 'offer_sent' && $toValue === 'accepted') {
                    $allowedWrestler = true;
                }
                if (! $allowedWrestler) {
                    abort(403, 'This submission transition is not allowed for wrestlers.');
                }
            }

            TransitionGuard::assertSubmission($fromValue, $toValue);

            $submission->update(['status' => $to]);

            return $submission->fresh();
        });
    }
}
