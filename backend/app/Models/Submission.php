<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SubmissionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id', 'wrestler_profile_id', 'status', 'note',
    ];

    protected function casts(): array
    {
        return [
            'status' => SubmissionStatus::class,
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function wrestlerProfile(): BelongsTo
    {
        return $this->belongsTo(WrestlerProfile::class);
    }

    public function booking(): HasOne
    {
        return $this->hasOne(Booking::class);
    }
}
