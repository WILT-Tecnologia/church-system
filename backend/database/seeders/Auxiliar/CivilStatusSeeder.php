<?php

namespace Database\Seeders\Auxiliar;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CivilStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->insert(Str::uuid(), '01', 'Casado(a)');
        $this->insert(Str::uuid(), '02', 'Divorciado(a)');
        $this->insert(Str::uuid(), '03', 'Separado(a)');
        $this->insert(Str::uuid(), '04', 'Solteiro(a)');
        $this->insert(Str::uuid(), '05', 'Viúvo(a)');
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
