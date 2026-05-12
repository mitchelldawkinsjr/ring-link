<?php

declare(strict_types=1);

namespace App\Observers;

use App\Actions\Audit\WriteAuditLogAction;
use App\Models\Submission;
use Illuminate\Support\Facades\Auth;

final class SubmissionObserver
{
    public function updated(Submission $submission): void
    {
        if (! $submission->wasChanged('status')) {
            return;
        }
        $actor = Auth::user();
        if (! $actor) {
            return;
        }
        app(WriteAuditLogAction::class)->execute(
            $actor,
            $submission,
            'submission_status_changed',
            (string) $submission->getRawOriginal('status'),
            $submission->status->value,
        );
    }
}
