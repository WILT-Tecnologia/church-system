<?php

namespace Database\Seeders;

use App\Models\Person;
use App\Models\User;
use Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PersonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void {
        Person::factory(10)->create();
    }
}
