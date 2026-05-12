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
            ->with([
                'booking.promotionProfile:id,user_id,promotion_name',
                'booking.wrestlerProfile:id,user_id,ring_name',
                'wrestlerProfile:id,user_id,ring_name',
                'promotionProfile:id,user_id,promotion_name',
                'messages' => fn ($q) => $q->latest()->limit(1),
            ])
            ->orderByDesc('updated_at')
            ->get()
            ->filter(fn (Conversation $c) => in_array($user->id, $c->participantUserIds(), true));

        return ApiEnvelope::json($items->values()->map(function (Conversation $c) {
            $wrestler = $c->wrestlerProfile ?? $c->booking?->wrestlerProfile;
            $promotion = $c->promotionProfile ?? $c->booking?->promotionProfile;
            $lastMessage = $c->messages->first();

            return [
                'id' => $c->id,
                'booking_id' => $c->booking_id,
                'wrestler_profile' => $wrestler ? [
                    'id' => $wrestler->id,
                    'ring_name' => $wrestler->ring_name,
                ] : null,
                'promotion_profile' => $promotion ? [
                    'id' => $promotion->id,
                    'promotion_name' => $promotion->promotion_name,
                ] : null,
                'last_message' => $lastMessage?->body,
                'last_message_at' => $lastMessage?->created_at?->toIso8601String()
                    ?? $c->updated_at?->toIso8601String(),
                'unread_count' => 0,
            ];
        })->all());
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
            // Reuse an existing direct thread between the same wrestler+promotion
            // pair if one is already open, so repeat "Message" clicks don't
            // spawn duplicate inbox rows.
            $conversation = Conversation::query()->firstOrCreate(
                [
                    'wrestler_profile_id' => $wId,
                    'promotion_profile_id' => $pId,
                    'booking_id' => null,
                ],
                []
            );
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
