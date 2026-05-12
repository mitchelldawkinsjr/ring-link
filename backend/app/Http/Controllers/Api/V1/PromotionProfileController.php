<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\PromotionProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PromotionProfileController extends Controller
{
    public function index(): JsonResponse
    {
        $items = PromotionProfile::query()->orderBy('id')->paginate(20);

        return ApiEnvelope::json(
            $items->getCollection()->map(fn (PromotionProfile $p) => $this->transform($p))->values()->all(),
            [
                'pagination' => [
                    'current_page' => $items->currentPage(),
                    'per_page' => $items->perPage(),
                    'total' => $items->total(),
                    'has_more' => $items->hasMorePages(),
                ],
            ]
        );
    }

    public function show(PromotionProfile $promotionProfile): JsonResponse
    {
        $this->authorize('view', $promotionProfile);

        return ApiEnvelope::json($this->transform($promotionProfile));
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', PromotionProfile::class);
        $data = $request->validate([
            'promotion_name' => ['required', 'string', 'max:160'],
            'city' => ['nullable', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'size:2'],
            'branding' => ['nullable', 'array'],
            'description' => ['nullable', 'string'],
            'ratings_opt_in' => ['nullable', 'boolean'],
        ]);

        $profile = PromotionProfile::query()->create([
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        return ApiEnvelope::json($this->transform($profile), [], 'Created', 201);
    }

    public function update(Request $request, PromotionProfile $promotionProfile): JsonResponse
    {
        $this->authorize('update', $promotionProfile);
        $data = $request->validate([
            'promotion_name' => ['sometimes', 'string', 'max:160'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'state' => ['sometimes', 'nullable', 'string', 'size:2'],
            'branding' => ['sometimes', 'nullable', 'array'],
            'description' => ['sometimes', 'nullable', 'string'],
            'ratings_opt_in' => ['sometimes', 'boolean'],
        ]);

        $promotionProfile->update($data);

        return ApiEnvelope::json($this->transform($promotionProfile->fresh()));
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(PromotionProfile $p): array
    {
        return [
            'id' => $p->id,
            'user_id' => $p->user_id,
            'promotion_name' => $p->promotion_name,
            'city' => $p->city,
            'state' => $p->state,
            'branding' => $p->branding,
            'description' => $p->description,
            'ratings_opt_in' => (bool) $p->ratings_opt_in,
        ];
    }
}
