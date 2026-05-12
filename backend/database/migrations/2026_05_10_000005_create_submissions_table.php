<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('wrestler_profile_id')->constrained('wrestler_profiles')->cascadeOnDelete();
            $table->enum('status', [
                'submitted', 'reviewing', 'interested', 'offer_sent', 'accepted',
                'declined', 'booked', 'completed', 'cancelled',
            ])->default('submitted');
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['event_id', 'wrestler_profile_id'], 'uniq_submission');
            $table->index('status', 'idx_submissions_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
