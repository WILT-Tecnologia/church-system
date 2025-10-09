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
            ['name' => 'Dashboard'],
            ['name' => 'Pessoas'],
            ['name' => 'Igrejas'],
            ['name' => 'Tipos de eventos'],
            ['name' => 'Cargos ministeriais'],
            ['name' => 'Origem do membro'],
            ['name' => 'Usuários'],
            ['name' => 'Perfis'],
            ['name' => 'Permissões'],
            ['name' => 'Configurações'],

            // Igreja
            ['name' => 'Membros'],
            ['name' => 'Convidados e Visitantes'],
            ['name' => 'Eventos'],
            ['name' => 'Tasks'],
            ['name' => 'Financeiro'],
        ];

        foreach ($modules as $module) {
            Module::firstOrCreate(['name' => $module['name']]);
        }
    }
}
