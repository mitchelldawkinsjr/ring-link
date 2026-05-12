<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'wrestler_profile_id', 'media_type', 'url', 'sort_order',
    ];

    public function wrestlerProfile(): BelongsTo
    {
        return $this->belongsTo(WrestlerProfile::class);
    }
}
