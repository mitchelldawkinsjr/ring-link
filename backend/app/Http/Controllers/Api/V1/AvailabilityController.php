<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\AvailabilityWindow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AvailabilityController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $wrestler = $request->user()->wrestlerProfile;
        abort_if(! $wrestler, 403);

        $data = $request->validate([
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
        ]);

        $window = AvailabilityWindow::query()->create([
            'wrestler_profile_id' => $wrestler->id,
            'starts_at' => $data['starts_at'],
            'ends_at' => $data['ends_at'],
        ]);

        return ApiEnvelope::json([
            'id' => $window->id,
            'starts_at' => $window->starts_at->toIso8601String(),
            'ends_at' => $window->ends_at->toIso8601String(),
        ], [], 'Created', 201);
    }
}
