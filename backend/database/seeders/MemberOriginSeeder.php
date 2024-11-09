<?php

namespace Database\Seeders;

use App\Models\MemberOrigin;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MemberOriginSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        MemberOrigin::factory(100)->create();
    }
}
