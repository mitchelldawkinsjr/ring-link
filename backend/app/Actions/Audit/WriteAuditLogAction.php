<?php

declare(strict_types=1);

namespace App\Actions\Audit;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

final class WriteAuditLogAction
{
    /**
     * @param  array<string, mixed>|null  $payload
     */
    public function execute(
        User $actor,
        Model $auditable,
        string $action,
        ?string $fromState,
        ?string $toState,
        ?array $payload = null
    ): void {
        AuditLog::query()->create([
            'actor_user_id' => $actor->id,
            'auditable_type' => $auditable->getMorphClass(),
            'auditable_id' => $auditable->getKey(),
            'action' => $action,
            'from_state' => $fromState,
            'to_state' => $toState,
            'payload' => $payload,
            'created_at' => now(),
        ]);
    }
}
