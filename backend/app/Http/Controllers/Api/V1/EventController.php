<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EventController extends Controller
{
    public function publicIndex(Request $request): JsonResponse
    {
        $promotionId = $request->query('promotion_id');
        $perPage = min((int) $request->query('per_page', 20), 100);

        $events = Event::query()
            ->with('promotionProfile')
            ->where('starts_at', '>=', now())
            ->when($promotionId !== null && $promotionId !== '', function ($q) use ($promotionId): void {
                $q->where('promotion_profile_id', (int) $promotionId);
            })
            ->orderBy('starts_at')
            ->paginate($perPage);

        return ApiEnvelope::json(
            $events->getCollection()->map(fn (Event $e) => $this->publicTransform($e))->values()->all(),
            [
                'pagination' => [
                    'current_page' => $events->currentPage(),
                    'per_page' => $events->perPage(),
                    'total' => $events->total(),
                    'has_more' => $events->hasMorePages(),
                ],
            ]
        );
    }

    public function index(Request $request): JsonResponse
    {
        $promotion = $request->user()->promotionProfile;
        abort_if(! $promotion, 403);
        $events = Event::query()->where('promotion_profile_id', $promotion->id)->orderByDesc('starts_at')->paginate(30);

        return ApiEnvelope::json(
            $events->getCollection()->map(fn (Event $e) => $this->transform($e))->values()->all(),
            [
                'pagination' => [
                    'current_page' => $events->currentPage(),
                    'per_page' => $events->perPage(),
                    'total' => $events->total(),
                    'has_more' => $events->hasMorePages(),
                ],
            ]
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Event::class);
        $promotion = $request->user()->promotionProfile;
        abort_if(! $promotion, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'starts_at' => ['required', 'date'],
            'venue' => ['nullable', 'string', 'max:160'],
            'city' => ['nullable', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'size:2'],
        ]);

        $event = Event::query()->create([
            ...$data,
            'promotion_profile_id' => $promotion->id,
        ]);

        return ApiEnvelope::json($this->transform($event), [], 'Created', 201);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:160'],
            'starts_at' => ['sometimes', 'date'],
            'venue' => ['sometimes', 'nullable', 'string', 'max:160'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'state' => ['sometimes', 'nullable', 'string', 'size:2'],
        ]);
        $event->update($data);

        return ApiEnvelope::json($this->transform($event->fresh()));
    }

    public function destroy(Event $event): JsonResponse
    {
        $this->authorize('delete', $event);
        $event->delete();

        return ApiEnvelope::json(null, [], 'Deleted');
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(Event $e): array
    {
        return [
            'id' => $e->id,
            'promotion_profile_id' => $e->promotion_profile_id,
            'name' => $e->name,
            'starts_at' => $e->starts_at?->toIso8601String(),
            'venue' => $e->venue,
            'city' => $e->city,
            'state' => $e->state,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function publicTransform(Event $e): array
    {
        return [
            'id' => $e->id,
            'name' => $e->name,
            'starts_at' => $e->starts_at?->toIso8601String(),
            'venue' => $e->venue,
            'city' => $e->city,
            'state' => $e->state,
            'promotion' => $e->promotionProfile ? [
                'id' => $e->promotionProfile->id,
                'promotion_name' => $e->promotionProfile->promotion_name,
                'city' => $e->promotionProfile->city,
                'state' => $e->promotionProfile->state,
            ] : null,
        ];
    }
}
