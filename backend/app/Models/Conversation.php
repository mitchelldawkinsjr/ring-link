<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id', 'wrestler_profile_id', 'promotion_profile_id',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function wrestlerProfile(): BelongsTo
    {
        return $this->belongsTo(WrestlerProfile::class);
    }

    public function promotionProfile(): BelongsTo
    {
        return $this->belongsTo(PromotionProfile::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * @return list<int>
     */
    public function participantUserIds(): array
    {
        $this->loadMissing(['booking.promotionProfile', 'booking.wrestlerProfile', 'promotionProfile', 'wrestlerProfile']);
        if ($this->booking_id && $this->booking) {
            return [
                (int) $this->booking->promotionProfile->user_id,
                (int) $this->booking->wrestlerProfile->user_id,
            ];
        }
        if ($this->promotion_profile_id && $this->wrestler_profile_id && $this->promotionProfile && $this->wrestlerProfile) {
            return [
                (int) $this->promotionProfile->user_id,
                (int) $this->wrestlerProfile->user_id,
            ];
        }

        return [];
    }
}
