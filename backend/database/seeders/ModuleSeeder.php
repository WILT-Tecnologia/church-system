<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void {
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

        foreach ($modules as $module) {
            Module::firstOrCreate(['name' => $module['name'], 'context' => $module['context']], $module);
        }
    }
}
