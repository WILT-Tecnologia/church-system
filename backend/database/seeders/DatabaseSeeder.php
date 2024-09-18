<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\Auxiliar\CivilStatusSeeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call(CivilStatusSeeder::class);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        if (env('APP_ENV') == 'local') {
            $this->call([
                PersonSeeder::class,
            ]);
        }
    }
}
