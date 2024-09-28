<?php

namespace Database\Factories;

use App\Models\Occupation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Occupation>
 */
class OccupationFactory extends Factory
{
    protected $model = Occupation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $occupations = [
            'Pastor',
            'Missionário',
            'Professor de Escola Dominical',
            'Diácono',
            'Evangelista',
            'Ministro de Música',
            'Administrador de Igreja',
            'Coordenador de Jovens',
            'Líder de Oração',
            'Conselheiro Espiritual',
        ];

        return [
            'name'        => $this->faker->randomElement($occupations),
            'description' => $this->faker->sentence(),
            'status'      => $this->faker->boolean(),
        ];
    }
}
