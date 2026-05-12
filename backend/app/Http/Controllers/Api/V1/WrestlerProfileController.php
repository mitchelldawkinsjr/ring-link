<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\WrestlerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class WrestlerProfileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'state' => ['sometimes', 'string', 'size:2'],
            'wrestling_style' => ['sometimes', 'string', 'max:120'],
            'gender_division' => ['sometimes', 'string', 'max:80'],
            'years_experience' => ['sometimes', 'integer', 'min:0', 'max:255'],
            'booking_rate_min' => ['sometimes', 'integer', 'min:0'],
            'booking_rate_max' => ['sometimes', 'integer', 'min:0'],
            'available_from' => ['sometimes', 'date'],
            'available_to' => ['sometimes', 'date', 'after_or_equal:available_from'],
        ]);

        $perPage = min((int) $request->query('per_page', 20), 100);
        $paginator = WrestlerProfile::query()
            ->with(['mediaLinks' => fn ($q) => $q->orderBy('sort_order')])
            ->discover($filters)
            ->orderBy('id')
            ->paginate($perPage);

        $items = $paginator->getCollection()->map(fn (WrestlerProfile $p) => $this->transform($p));
        // Note: list view is always public-facing, so opt-out wrestlers do not leak rating data here.

        return ApiEnvelope::json($items->values()->all(), [
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    public function show(Request $request, WrestlerProfile $wrestlerProfile): JsonResponse
    {
        $this->authorize('view', $wrestlerProfile);
        $wrestlerProfile->load(['mediaLinks' => fn ($q) => $q->orderBy('sort_order')]);

        return ApiEnvelope::json($this->transform($wrestlerProfile, $this->isOwner($request, $wrestlerProfile)));
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', WrestlerProfile::class);
        $data = $request->validate([
            'ring_name' => ['required', 'string', 'max:120'],
            'hometown' => ['nullable', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'size:2'],
            'wrestling_style' => ['nullable', 'string', 'max:120'],
            'match_types' => ['nullable', 'array'],
            'gimmick' => ['nullable', 'string'],
            'travel_radius_miles' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'years_experience' => ['nullable', 'integer', 'min:0', 'max:255'],
            'gender_division' => ['nullable', 'string', 'max:80'],
            'booking_rate_min' => ['nullable', 'integer', 'min:0'],
            'booking_rate_max' => ['nullable', 'integer', 'min:0'],
            'social_links' => ['nullable', 'array'],
            'ratings_opt_in' => ['nullable', 'boolean'],
        ]);

        $profile = WrestlerProfile::query()->create([
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        return ApiEnvelope::json($this->transform($profile), [], 'Created', 201);
    }

    public function update(Request $request, WrestlerProfile $wrestlerProfile): JsonResponse
    {
        $this->authorize('update', $wrestlerProfile);
        $data = $request->validate([
            'ring_name' => ['sometimes', 'string', 'max:120'],
            'hometown' => ['sometimes', 'nullable', 'string', 'max:120'],
            'state' => ['sometimes', 'nullable', 'string', 'size:2'],
            'wrestling_style' => ['sometimes', 'nullable', 'string', 'max:120'],
            'match_types' => ['sometimes', 'nullable', 'array'],
            'gimmick' => ['sometimes', 'nullable', 'string'],
            'travel_radius_miles' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:65535'],
            'years_experience' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:255'],
            'gender_division' => ['sometimes', 'nullable', 'string', 'max:80'],
            'booking_rate_min' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'booking_rate_max' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'social_links' => ['sometimes', 'nullable', 'array'],
            'ratings_opt_in' => ['sometimes', 'boolean'],
        ]);

        $wrestlerProfile->update($data);
        $fresh = $wrestlerProfile->fresh();

        return ApiEnvelope::json($this->transform($fresh, $this->isOwner($request, $fresh)));
    }

    private function isOwner(Request $request, WrestlerProfile $profile): bool
    {
        $user = $request->user();

        return $user !== null && $user->id === $profile->user_id;
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(WrestlerProfile $p, bool $isOwner = false): array
    {
        // Owners always see their own rating so they can decide whether to opt in.
        $showRating = $isOwner || $p->ratings_opt_in;

        return [
            'id' => $p->id,
            'user_id' => $p->user_id,
            'ring_name' => $p->ring_name,
            'hometown' => $p->hometown,
            'state' => $p->state,
            'wrestling_style' => $p->wrestling_style,
            'match_types' => $p->match_types,
            'gimmick' => $p->gimmick,
            'travel_radius_miles' => $p->travel_radius_miles,
            'years_experience' => $p->years_experience,
            'gender_division' => $p->gender_division,
            'booking_rate_min' => $p->booking_rate_min,
            'booking_rate_max' => $p->booking_rate_max,
            'social_links' => $p->social_links,
            'ratings_opt_in' => (bool) $p->ratings_opt_in,
            'review_count' => $showRating ? $p->review_count : null,
            'average_rating' => $showRating ? $p->average_rating : null,
            'media_links' => $p->relationLoaded('mediaLinks')
                ? $p->mediaLinks->map(fn ($m) => [
                    'id' => $m->id,
                    'media_type' => $m->media_type,
                    'url' => $m->url,
                    'sort_order' => $m->sort_order,
                ])->values()->all()
                : [],
        ];
    }
}
