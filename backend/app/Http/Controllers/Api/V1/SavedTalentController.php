<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\SavedTalent;
use App\Models\WrestlerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SavedTalentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $promotion = $request->user()->promotionProfile;
        abort_if(! $promotion, 403);

        $rows = SavedTalent::query()
            ->where('promotion_profile_id', $promotion->id)
            ->with('wrestlerProfile')
            ->orderByDesc('id')
            ->get();

        return ApiEnvelope::json($rows->map(fn (SavedTalent $s) => [
            'id' => $s->id,
            'wrestler_profile_id' => $s->wrestler_profile_id,
            'ring_name' => $s->wrestlerProfile->ring_name,
        ])->values()->all());
    }

    public function store(Request $request, WrestlerProfile $wrestlerProfile): JsonResponse
    {
        $promotion = $request->user()->promotionProfile;
        abort_if(! $promotion, 403);

        $saved = SavedTalent::query()->firstOrCreate([
            'promotion_profile_id' => $promotion->id,
            'wrestler_profile_id' => $wrestlerProfile->id,
        ], [
            'created_at' => now(),
        ]);

        return ApiEnvelope::json(['id' => $saved->id], [], 'Saved', 201);
    }

    public function destroy(Request $request, WrestlerProfile $wrestlerProfile): JsonResponse
    {
        $promotion = $request->user()->promotionProfile;
        abort_if(! $promotion, 403);

        SavedTalent::query()
            ->where('promotion_profile_id', $promotion->id)
            ->where('wrestler_profile_id', $wrestlerProfile->id)
            ->delete();

        return ApiEnvelope::json(null, [], 'Removed');
    }
}
