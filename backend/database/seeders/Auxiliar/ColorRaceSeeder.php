<?php

namespace Database\Seeders\Auxiliar;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ColorRaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->insert(Str::uuid(), '01', 'Amarela');
        $this->insert(Str::uuid(),'02', 'Branca');
        $this->insert(Str::uuid(), '03', 'IndÍgena');
        $this->insert(Str::uuid(), '04', 'Parda');
        $this->insert(Str::uuid(), '05', 'Preta');
    }

    protected function insert($id, $codigo, $name): void
    {
        if (DB::table('aux_civil_status')->where('name', $name)->get()->isEmpty()) {
            DB::table('aux_civil_status')->insert([
                'id' => $id,
                'codigo' => $codigo,
                'name'      => $name,
            ]);
        }
    }
}
