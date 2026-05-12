<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->unique()->constrained('submissions')->cascadeOnDelete();
            $table->foreignId('promotion_profile_id')->constrained('promotion_profiles')->cascadeOnDelete();
            $table->foreignId('wrestler_profile_id')->constrained('wrestler_profiles')->cascadeOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->unsignedInteger('fee_cents')->nullable();
            $table->dateTime('booked_at')->nullable();
            $table->timestamps();
            $table->index('status', 'idx_bookings_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
