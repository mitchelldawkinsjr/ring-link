<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Auth\RegisterUserAction;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

final class AuthController extends Controller
{
    public function register(Request $request, RegisterUserAction $registerUser): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in([UserRole::Wrestler->value, UserRole::Promotion->value])],
        ]);

        $user = $registerUser->execute($data['name'], $data['email'], $data['password'], UserRole::from($data['role']));
        $token = $user->createToken('api')->plainTextToken;

        return ApiEnvelope::json([
            'user' => $this->userPayload($user),
            'token' => $token,
        ], [], 'Registered', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return ApiEnvelope::json(null, [], 'Invalid credentials', 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return ApiEnvelope::json([
            'user' => $this->userPayload($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return ApiEnvelope::json(null, [], 'Logged out');
    }

    public function me(Request $request): JsonResponse
    {
        return ApiEnvelope::json($this->userPayload($request->user()));
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(?User $user): array
    {
        if (! $user) {
            return [];
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
            'wrestler_profile_id' => $user->wrestlerProfile?->id,
            'promotion_profile_id' => $user->promotionProfile?->id,
        ];
    }
}
