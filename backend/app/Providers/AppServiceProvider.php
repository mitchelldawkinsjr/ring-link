<?php

namespace App\Providers;

use App\Jobs\SendRinglinkAlertJob;
use App\Models\Booking;
use App\Models\Message;
use App\Models\Submission;
use App\Models\VerifiedBookingReview;
use App\Observers\BookingObserver;
use App\Observers\SubmissionObserver;
use App\Observers\VerifiedBookingReviewObserver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (! $this->app->environment('production')) {
            Model::preventLazyLoading();
        }

        Submission::observe(SubmissionObserver::class);
        Booking::observe(BookingObserver::class);
        VerifiedBookingReview::observe(VerifiedBookingReviewObserver::class);

        Message::created(function (Message $message): void {
            $message->loadMissing('conversation');
            $conversation = $message->conversation;
            if (! $conversation) {
                return;
            }
            foreach ($conversation->participantUserIds() as $userId) {
                if ($userId !== $message->sender_user_id) {
                    SendRinglinkAlertJob::dispatch($userId, 'new_message', [
                        'message_id' => $message->id,
                        'conversation_id' => $conversation->id,
                    ]);
                }
            }
        });
    }
}
