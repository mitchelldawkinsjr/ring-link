<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wrestler_profiles', function (Blueprint $table) {
            $table->boolean('ratings_opt_in')->default(false)->after('social_links');
        });

        Schema::table('promotion_profiles', function (Blueprint $table) {
            $table->boolean('ratings_opt_in')->default(false)->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('wrestler_profiles', function (Blueprint $table) {
            $table->dropColumn('ratings_opt_in');
        });

        Schema::table('promotion_profiles', function (Blueprint $table) {
            $table->dropColumn('ratings_opt_in');
        });
    }
};
