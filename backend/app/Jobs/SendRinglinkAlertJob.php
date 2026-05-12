<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\RinglinkAlertMail;
use App\Models\InAppNotification;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

final class SendRinglinkAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $userId,
        public string $type,
        /** @var array<string, mixed> */
        public array $payload,
    ) {}

    public function handle(): void
    {
        InAppNotification::query()->create([
            'user_id' => $this->userId,
            'type' => $this->type,
            'payload' => $this->payload,
        ]);

        $user = User::query()->find($this->userId);
        if ($user && $user->email) {
            Mail::to($user->email)->send(new RinglinkAlertMail($this->type, $this->payload));
        }
    }
}
