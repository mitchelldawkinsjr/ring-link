<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return in_array($user->id, $conversation->participantUserIds(), true)
            || $user->role === UserRole::Admin;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [UserRole::Wrestler, UserRole::Promotion], true);
    }

    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }
}
