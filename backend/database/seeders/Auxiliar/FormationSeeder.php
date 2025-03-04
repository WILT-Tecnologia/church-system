<?php

namespace Database\Seeders\Auxiliar;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FormationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->insert(Str::uuid(), '01', 'Analfabeto');
        $this->insert(Str::uuid(),'02', 'Lê e Escreve');
        $this->insert(Str::uuid(), '03', 'Ensino Fudamental Incompleto');
        $this->insert(Str::uuid(), '04', 'Ensino Fudamental Completo');
        $this->insert(Str::uuid(), '05', 'Ensino Médio Incompleto');
        $this->insert(Str::uuid(), '06', 'Ensino Médio Completo');
        $this->insert(Str::uuid(), '07', 'Graduação Incompleto');
        $this->insert(Str::uuid(), '08', 'Graduação Completo');
        $this->insert(Str::uuid(), '09', 'Pós-Graduado');
        $this->insert(Str::uuid(), '10', 'Mestrado');
        $this->insert(Str::uuid(), '11', 'Doutorado');
        $this->insert(Str::uuid(), '12', 'Pós-Doutorado');
    }

    protected function insert($id, $codigo, $name): void
    {
        if (DB::table('aux_formation')->where('name', $name)->get()->isEmpty()) {
            DB::table('aux_formation')->insert([
                'id' => $id,
                'codigo' => $codigo,
                'name'      => $name,
            ]);
        }
    }
}
