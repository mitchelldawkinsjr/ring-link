<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Submissions\CreateSubmissionAction;
use App\Actions\Submissions\TransitionSubmissionAction;
use App\Enums\SubmissionStatus;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\Event;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

final class SubmissionController extends Controller
{
    public function store(Request $request, CreateSubmissionAction $action): JsonResponse
    {
        $this->authorize('create', Submission::class);
        $wrestler = $request->user()->wrestlerProfile;
        abort_if(! $wrestler, 403);

        $data = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'note' => ['nullable', 'string'],
        ]);

        $event = Event::query()->findOrFail($data['event_id']);
        $submission = $action->execute($event, $wrestler, $data['note'] ?? null);

        return ApiEnvelope::json($this->transform($submission), [], 'Created', 201);
    }

    public function updateStatus(Request $request, Submission $submission, TransitionSubmissionAction $action): JsonResponse
    {
        $this->authorize('transition', $submission);
        $data = $request->validate([
            'status' => ['required', new Enum(SubmissionStatus::class)],
        ]);
        $to = $data['status'] instanceof SubmissionStatus
            ? $data['status']
            : SubmissionStatus::from((string) $data['status']);
        $submission = $action->execute($submission, $to, $request->user());

        return ApiEnvelope::json($this->transform($submission));
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(Submission $s): array
    {
        return [
            'id' => $s->id,
            'event_id' => $s->event_id,
            'wrestler_profile_id' => $s->wrestler_profile_id,
            'status' => $s->status->value,
            'note' => $s->note,
        ];
    }
}
