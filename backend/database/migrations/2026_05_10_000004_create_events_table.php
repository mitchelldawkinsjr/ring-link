<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_profile_id')->constrained('promotion_profiles')->cascadeOnDelete();
            $table->string('name', 160);
            $table->dateTime('starts_at');
            $table->string('venue', 160)->nullable();
            $table->string('city', 120)->nullable();
            $table->char('state', 2)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('starts_at', 'idx_events_start');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
