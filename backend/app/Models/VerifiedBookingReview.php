<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerifiedBookingReview extends Model
{
    use HasFactory;

    protected $table = 'verified_booking_reviews';

    protected $fillable = [
        'booking_id', 'promotion_profile_id', 'wrestler_profile_id',
        'overall_rating', 'professionalism_rating', 'communication_rating',
        'in_ring_rating', 'reliability_rating', 'crowd_reaction_rating',
        'review_text', 'moderation_status',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function promotionProfile(): BelongsTo
    {
        return $this->belongsTo(PromotionProfile::class);
    }

    public function wrestlerProfile(): BelongsTo
    {
        return $this->belongsTo(WrestlerProfile::class);
    }
}
