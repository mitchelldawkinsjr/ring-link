<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verified_booking_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->unique()->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('promotion_profile_id')->constrained('promotion_profiles')->cascadeOnDelete();
            $table->foreignId('wrestler_profile_id')->constrained('wrestler_profiles')->cascadeOnDelete();
            $table->unsignedTinyInteger('overall_rating');
            $table->unsignedTinyInteger('professionalism_rating');
            $table->unsignedTinyInteger('communication_rating');
            $table->unsignedTinyInteger('in_ring_rating');
            $table->unsignedTinyInteger('reliability_rating');
            $table->unsignedTinyInteger('crowd_reaction_rating');
            $table->text('review_text')->nullable();
            $table->enum('moderation_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verified_booking_reviews');
    }
};
