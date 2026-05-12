<?php

declare(strict_types=1);

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

final class ApiEnvelope
{
    /**
     * @param  array<string, mixed>  $meta
     */
    public static function json(mixed $data, array $meta = [], string $message = '', int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'meta' => $meta,
            'message' => $message,
        ], $status);
    }
}
