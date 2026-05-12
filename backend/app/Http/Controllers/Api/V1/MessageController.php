<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MessageController extends Controller
{
    public function markRead(Request $request, Message $message): JsonResponse
    {
        $message->load('conversation');
        $this->authorize('view', $message->conversation);
        if ($message->sender_user_id === $request->user()->id) {
            return ApiEnvelope::json(['id' => $message->id, 'read_at' => $message->read_at?->toIso8601String()]);
        }
        $message->update(['read_at' => now()]);

        return ApiEnvelope::json([
            'id' => $message->id,
            'read_at' => $message->read_at->toIso8601String(),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $conversationIds = Conversation::query()->get()
            ->filter(fn (Conversation $c) => in_array($user->id, $c->participantUserIds(), true))
            ->pluck('id');

        $count = Message::query()
            ->whereIn('conversation_id', $conversationIds)
            ->where('sender_user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->count();

        return ApiEnvelope::json(['unread_count' => $count]);
    }
}
