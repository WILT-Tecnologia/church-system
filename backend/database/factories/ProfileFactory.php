<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Profile>
 */
class ProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $profiles = [
            'admin' => 'Administrador',
            'member' => 'Membro',
            'teacher' => 'Professor',
            'student' => 'Estudante',
            'secretary' => 'Secretaria',
            'receptionist' => 'Recepcionista',
            'manager' => 'Gerente',
            'developer' => 'Desenvolvedor',
            'DBA' => 'Administrador de Banco de Dados',
            'guest' => 'Visitante',
        ];

        $description_profiles = [
            'admin' => 'Administrador do sistema',
            'member' => 'Membro da igreja',
            'teacher' => 'Professor da igreja',
            'student' => 'Estudante da igreja',
            'secretary' => 'Secretaria da igreja',
            'receptionist' => 'Recepcionista da igreja',
            'manager' => 'Gerente da igreja',
            'developer' => 'Desenvolvedor da igreja',
            'DBA' => 'Administrador de Banco de Dados da igreja',
            'guest' => 'Visitante da igreja',
        ];

        $profile_key = $this->faker->unique()->randomElement(array_keys($profiles));

        return [
            'name' => $profiles[$profile_key],
            'description' => $description_profiles[$profile_key],
            'status' => $this->faker->boolean(),
        ];
    }
}
