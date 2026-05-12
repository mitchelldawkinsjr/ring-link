<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WrestlerProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'ring_name', 'hometown', 'state', 'wrestling_style', 'match_types',
        'gimmick', 'travel_radius_miles', 'years_experience', 'gender_division',
        'booking_rate_min', 'booking_rate_max', 'social_links', 'review_count', 'average_rating',
        'ratings_opt_in',
    ];

    protected function casts(): array
    {
        return [
            'match_types' => 'array',
            'social_links' => 'array',
            'average_rating' => 'decimal:2',
            'ratings_opt_in' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mediaLinks(): HasMany
    {
        return $this->hasMany(MediaLink::class);
    }

    public function availabilityWindows(): HasMany
    {
        return $this->hasMany(AvailabilityWindow::class);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function scopeDiscover(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['state'] ?? null, fn (Builder $q, string $s) => $q->where('state', $s))
            ->when($filters['wrestling_style'] ?? null, fn (Builder $q, string $s) => $q->where('wrestling_style', $s))
            ->when($filters['gender_division'] ?? null, fn (Builder $q, string $g) => $q->where('gender_division', $g))
            ->when($filters['years_experience'] ?? null, fn (Builder $q, int $y) => $q->where('years_experience', $y))
            ->when($filters['booking_rate_min'] ?? null, fn (Builder $q, int $v) => $q->where('booking_rate_max', '>=', $v))
            ->when($filters['booking_rate_max'] ?? null, fn (Builder $q, int $v) => $q->where('booking_rate_min', '<=', $v))
            ->when(
                ! empty($filters['available_from']) && ! empty($filters['available_to']),
                function (Builder $q) use ($filters): void {
                    $from = $filters['available_from'];
                    $to = $filters['available_to'];
                    $q->whereHas('availabilityWindows', function (Builder $aw) use ($from, $to): void {
                        $aw->where('starts_at', '<=', $to)->where('ends_at', '>=', $from);
                    });
                }
            );
    }
}
