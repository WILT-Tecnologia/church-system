<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Person>
 */
class PersonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $sexo = $this->faker->randomElement(['M', 'F']);

        return [
            'image' => null,
            'name' => $this->faker->unique()->name($sexo == 'M' ? 'Male' : 'Female'),
            'cpf' => $this->faker->unique()->cpf(false),
            'birth_date' => $this->faker->date(),
            'email' => $this->faker->unique()->email(),
            'phone_one' => $this->faker->areaCode() . $this->faker->cellphone(false),
            'phone_two' => $this->faker->areaCode() . $this->faker->cellphone(false),
            'sex' => $sexo,
            'cep' => $this->faker->randomNumber(8, true),
            'street' => $this->faker->streetName(),
            'number' => $this->faker->buildingNumber(),
            'complement' => null,
            'district' => $this->faker->streetSuffix(),
            'city' => $this->faker->city(),
            'state' => $this->faker->stateAbbr(),
            'country' => $this->faker->country(),
        ];
    }
}
