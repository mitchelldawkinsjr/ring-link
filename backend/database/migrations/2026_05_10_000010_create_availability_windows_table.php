<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('availability_windows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wrestler_profile_id')->constrained('wrestler_profiles')->cascadeOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->timestamps();
            $table->index(['starts_at', 'ends_at'], 'idx_availability_window');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('availability_windows');
    }
};
