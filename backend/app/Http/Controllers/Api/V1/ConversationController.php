<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\Booking;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $items = Conversation::query()
            ->with(['booking', 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->orderByDesc('id')
            ->get()
            ->filter(fn (Conversation $c) => in_array($user->id, $c->participantUserIds(), true));

        return ApiEnvelope::json($items->values()->map(fn (Conversation $c) => [
            'id' => $c->id,
            'booking_id' => $c->booking_id,
            'last_message' => $c->messages->first()?->body,
        ])->all());
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Conversation::class);

        if ($request->filled('booking_id')) {
            $data = $request->validate([
                'booking_id' => ['required', 'exists:bookings,id'],
            ]);
            $booking = Booking::query()->findOrFail($data['booking_id']);
            $this->authorize('view', $booking);
            $conversation = Conversation::query()->firstOrCreate(
                ['booking_id' => $booking->id],
                [
                    'wrestler_profile_id' => null,
                    'promotion_profile_id' => null,
                ]
            );
        } else {
            $data = $request->validate([
                'wrestler_profile_id' => ['required', 'exists:wrestler_profiles,id'],
                'promotion_profile_id' => ['required', 'exists:promotion_profiles,id'],
            ]);
            $wId = (int) $data['wrestler_profile_id'];
            $pId = (int) $data['promotion_profile_id'];
            if ($request->user()->wrestlerProfile?->id !== $wId && $request->user()->promotionProfile?->id !== $pId) {
                abort(403);
            }
            $conversation = Conversation::query()->create([
                'booking_id' => null,
                'wrestler_profile_id' => $wId,
                'promotion_profile_id' => $pId,
            ]);
        }

        return ApiEnvelope::json(['id' => $conversation->id], [], 'Created', 201);
    }

    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $messages = $conversation->messages()->with('sender')->orderBy('id')->paginate(50);

        return ApiEnvelope::json(
            $messages->getCollection()->map(fn ($m) => [
                'id' => $m->id,
                'sender_user_id' => $m->sender_user_id,
                'body' => $m->body,
                'read_at' => $m->read_at?->toIso8601String(),
                'created_at' => $m->created_at?->toIso8601String(),
            ])->values()->all(),
            [
                'pagination' => [
                    'current_page' => $messages->currentPage(),
                    'per_page' => $messages->perPage(),
                    'total' => $messages->total(),
                    'has_more' => $messages->hasMorePages(),
                ],
            ]
        );
    }

    public function storeMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('sendMessage', $conversation);
        $data = $request->validate([
            'body' => ['required', 'string', 'max:20000'],
        ]);
        $message = $conversation->messages()->create([
            'sender_user_id' => $request->user()->id,
            'body' => $data['body'],
        ]);

        return ApiEnvelope::json([
            'id' => $message->id,
            'conversation_id' => $conversation->id,
            'sender_user_id' => $message->sender_user_id,
            'body' => $message->body,
        ], [], 'Created', 201);
    }
}
