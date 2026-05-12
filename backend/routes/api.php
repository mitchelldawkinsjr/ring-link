<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AvailabilityController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ConversationController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\PromotionProfileController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\SavedTalentController;
use App\Http\Controllers\Api\V1\SubmissionController;
use App\Http\Controllers\Api\V1\WrestlerProfileController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/wrestlers', [WrestlerProfileController::class, 'index']);
Route::get('/wrestlers/{wrestlerProfile}', [WrestlerProfileController::class, 'show']);

Route::get('/promotions', [PromotionProfileController::class, 'index']);
Route::get('/promotions/{promotionProfile}', [PromotionProfileController::class, 'show']);

Route::get('/events', [EventController::class, 'publicIndex']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::post('/wrestlers', [WrestlerProfileController::class, 'store']);
    Route::patch('/wrestlers/{wrestlerProfile}', [WrestlerProfileController::class, 'update']);

    Route::post('/promotions', [PromotionProfileController::class, 'store']);
    Route::patch('/promotions/{promotionProfile}', [PromotionProfileController::class, 'update']);

    Route::get('/promotion/events', [EventController::class, 'index']);
    Route::post('/promotion/events', [EventController::class, 'store']);
    Route::patch('/promotion/events/{event}', [EventController::class, 'update']);
    Route::delete('/promotion/events/{event}', [EventController::class, 'destroy']);

    Route::post('/submissions', [SubmissionController::class, 'store']);
    Route::patch('/submissions/{submission}/status', [SubmissionController::class, 'updateStatus']);

    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);

    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::patch('/reviews/{verifiedBookingReview}/moderation', [ReviewController::class, 'moderate']);

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'storeMessage']);

    Route::patch('/messages/{message}/read', [MessageController::class, 'markRead']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);

    Route::get('/wrestlers/my-media', [MediaController::class, 'listOwn']);
    Route::post('/media/upload-intent', [MediaController::class, 'uploadIntent']);
    Route::post('/media/confirm', [MediaController::class, 'confirm']);
    Route::delete('/media/{mediaLink}', [MediaController::class, 'destroy']);
    Route::patch('/wrestlers/{wrestlerProfile}/media/order', [MediaController::class, 'reorder']);
    Route::get('/wrestler/media', [MediaController::class, 'listOwn']);
    Route::post('/wrestler/videos', [MediaController::class, 'storeVideo']);

    Route::post('/wrestlers/availability', [AvailabilityController::class, 'store']);

    Route::get('/promotion/saved-talent', [SavedTalentController::class, 'index']);
    Route::post('/promotion/saved-talent/{wrestlerProfile}', [SavedTalentController::class, 'store']);
    Route::delete('/promotion/saved-talent/{wrestlerProfile}', [SavedTalentController::class, 'destroy']);
});
