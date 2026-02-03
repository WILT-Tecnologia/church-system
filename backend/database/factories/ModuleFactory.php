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
            // Administrativo
            ['name' => 'Dashboard Administrativo', 'context' => 'administrative'],
            ['name' => 'Pessoas', 'context' => 'administrative'],
            ['name' => 'Igrejas', 'context' => 'administrative'],
            ['name' => 'Tipos de eventos', 'context' => 'administrative'],
            ['name' => 'Cargos ministeriais', 'context' => 'administrative'],
            ['name' => 'Origem do membro', 'context' => 'administrative'],
            ['name' => 'Usuários', 'context' => 'administrative'],
            ['name' => 'Perfis', 'context' => 'administrative'],
            ['name' => 'Módulos', 'context' => 'administrative'],
            ['name' => 'Configurações Administrativas', 'context' => 'administrative'],

            // Igreja
            ['name' => 'Dashboard Igreja', 'context' => 'church'],
            ['name' => 'Membros', 'context' => 'church'],
            ['name' => 'Convidados e Visitantes', 'context' => 'church'],
            ['name' => 'Eventos', 'context' => 'church'],
            ['name' => 'Tasks', 'context' => 'church'],
            ['name' => 'Financeiro', 'context' => 'church'],
            ['name' => 'Patrimônios', 'context' => 'church'],
            ['name' => 'Fornecedores', 'context' => 'church'],
            ['name' => 'Categorias Financeiras', 'context' => 'church'],
            ['name' => 'Lançamentos Financeiros', 'context' => 'church'],
            ['name' => 'Configurações Igreja', 'context' => 'church'],
        ];

        return [
            'name' => $this->faker->unique()->randomElement($modules),
        ];
    }
}
