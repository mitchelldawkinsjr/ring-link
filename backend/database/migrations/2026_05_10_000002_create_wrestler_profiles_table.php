<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wrestler_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('ring_name', 120);
            $table->string('hometown', 120)->nullable();
            $table->char('state', 2)->nullable();
            $table->string('wrestling_style', 120)->nullable();
            $table->json('match_types')->nullable();
            $table->text('gimmick')->nullable();
            $table->unsignedSmallInteger('travel_radius_miles')->nullable();
            $table->unsignedTinyInteger('years_experience')->nullable();
            $table->string('gender_division', 80)->nullable();
            $table->unsignedInteger('booking_rate_min')->nullable();
            $table->unsignedInteger('booking_rate_max')->nullable();
            $table->json('social_links')->nullable();
            $table->unsignedInteger('review_count')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['state', 'wrestling_style', 'years_experience'], 'idx_wrestlers_discovery');
            $table->index(['booking_rate_min', 'booking_rate_max'], 'idx_wrestlers_rate');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wrestler_profiles');
    }
};
