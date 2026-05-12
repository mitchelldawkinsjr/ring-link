<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_talent', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_profile_id')->constrained('promotion_profiles')->cascadeOnDelete();
            $table->foreignId('wrestler_profile_id')->constrained('wrestler_profiles')->cascadeOnDelete();
            $table->timestamp('created_at')->nullable();
            $table->unique(['promotion_profile_id', 'wrestler_profile_id'], 'uniq_saved_talent');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_talent');
    }
};
