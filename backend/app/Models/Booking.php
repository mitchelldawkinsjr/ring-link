<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id', 'promotion_profile_id', 'wrestler_profile_id', 'status', 'fee_cents', 'booked_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => BookingStatus::class,
            'booked_at' => 'datetime',
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function promotionProfile(): BelongsTo
    {
        return $this->belongsTo(PromotionProfile::class);
    }

    public function wrestlerProfile(): BelongsTo
    {
        return $this->belongsTo(WrestlerProfile::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function verifiedReview(): HasOne
    {
        return $this->hasOne(VerifiedBookingReview::class);
    }
}
