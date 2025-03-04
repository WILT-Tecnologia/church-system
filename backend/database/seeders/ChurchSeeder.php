<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Church;
use App\Models\Person;
use Faker\Factory as Faker;

class ChurchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void {
        $faker = Faker::create('pt_BR');

        $responsibles = Person::all()->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            Church::create([
                'responsible_id' => $faker->randomElement($responsibles),
                'name' => $faker->company,
                'email' => $faker->unique()->safeEmail,
                'cnpj' => $faker->cnpj(false),  // CNPJ válido
                'cep' => $faker->postcode,
                'street' => $faker->streetName,
                'number' => $faker->buildingNumber,
                'complement' => $faker->secondaryAddress,
                'district' => $faker->citySuffix,
                'city' => $faker->city,
                'state' => $faker->stateAbbr,
                'country' => 'Brasil',
                'logo' => $faker->imageUrl(100, 100, 'logo'),
                'favicon' => $faker->imageUrl(32, 32, 'favicon'),
                'background' => $faker->imageUrl(1920, 1080, 'church'),
                'color' => $faker->hexColor,
            ]);
        }
    }
}
