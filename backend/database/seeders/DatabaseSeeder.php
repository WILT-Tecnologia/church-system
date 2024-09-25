<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\Auxiliar\CivilStatusSeeder;
use Database\Seeders\Auxiliar\ColorRaceSeeder;
use Database\Seeders\Auxiliar\FormationSeeder;
use Database\Seeders\Auxiliar\KinshipSeeder;
use Database\Seeders\Auxiliar\MemberSituationSeeder;
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

        $this->call([
            CivilStatusSeeder::class,
            ColorRaceSeeder::class,
            FormationSeeder::class,
            KinshipSeeder::class,
            MemberSituationSeeder::class,
        ]);


        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        if (env('APP_ENV') == 'local') {
            $this->call([
                PersonSeeder::class,
            ]);
        }
    }
}
