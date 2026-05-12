<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'admin@ringlink.local'],
            [
                'name' => 'RingLink Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
            ]
        );

        $this->call(DemoDataSeeder::class);
    }
}
