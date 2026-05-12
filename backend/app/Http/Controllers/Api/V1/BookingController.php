<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Bookings\CreateBookingAction;
use App\Actions\Bookings\TransitionBookingAction;
use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\Booking;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

final class BookingController extends Controller
{
    public function store(Request $request, CreateBookingAction $action): JsonResponse
    {
        $this->authorize('create', Booking::class);
        $data = $request->validate([
            'submission_id' => ['required', 'exists:submissions,id'],
            'fee_cents' => ['nullable', 'integer', 'min:0'],
        ]);
        $submission = Submission::query()->with('event')->findOrFail($data['submission_id']);
        if ($submission->event->promotion_profile_id !== $request->user()->promotionProfile?->id) {
            abort(403, 'You do not manage this event.');
        }

        $booking = $action->execute($submission, $data['fee_cents'] ?? null);

        return ApiEnvelope::json($this->transform($booking), [], 'Created', 201);
    }

    public function updateStatus(Request $request, Booking $booking, TransitionBookingAction $action): JsonResponse
    {
        $this->authorize('transition', $booking);
        $data = $request->validate([
            'status' => ['required', new Enum(BookingStatus::class)],
        ]);
        $to = $data['status'] instanceof BookingStatus
            ? $data['status']
            : BookingStatus::from((string) $data['status']);
        $booking = $action->execute($booking, $to, $request->user());

        return ApiEnvelope::json($this->transform($booking));
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(Booking $b): array
    {
        return [
            'id' => $b->id,
            'submission_id' => $b->submission_id,
            'promotion_profile_id' => $b->promotion_profile_id,
            'wrestler_profile_id' => $b->wrestler_profile_id,
            'status' => $b->status->value,
            'fee_cents' => $b->fee_cents,
            'booked_at' => $b->booked_at?->toIso8601String(),
        ];
    }
}
