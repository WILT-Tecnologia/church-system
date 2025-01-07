<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Module>
 */
class ModuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $modules = [
            'administrative' => 'Administrativo',
            'church' => 'Igreja',
            'users' => 'Usuários',
            'profiles' => 'Perfis',
            'persons' => 'Pessoas',
            'churchs' => 'Igrejas',
            'events' => 'Eventos',
            'families' => 'Famílias',
            'members' => 'Membros',
            'occupations' => 'Ocupações',
            'situations' => 'Situações',
            'tasks' => 'Tarefas',
            'memberOrigin' => 'Origem do membro',
            'eventTypes' => 'Tipos de eventos',
        ];

        return [
            'name' => $this->faker->unique()->randomElement($modules),
        ];
    }
}
