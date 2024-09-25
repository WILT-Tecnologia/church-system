<?php

namespace Database\Seeders\Auxiliar;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class KinshipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->insert(Str::uuid(), '01', 'Filho(a)');
        $this->insert(Str::uuid(), '02', 'Cônjuge');
        $this->insert(Str::uuid(), '03', 'Pai');
        $this->insert(Str::uuid(), '04', 'Mãe');
        $this->insert(Str::uuid(), '05', 'Sogro(a)');
        $this->insert(Str::uuid(), '06', 'Outros');
        $this->insert(Str::uuid(), '07', 'Avô(ó)');
        $this->insert(Str::uuid(), '08', 'Companheiro(a)');
        $this->insert(Str::uuid(), '09', 'Enteado(a)');
        $this->insert(Str::uuid(), '10', 'Irmã(o)');
        $this->insert(Str::uuid(), '11', 'Ex-conjuge');
        $this->insert(Str::uuid(), '12', 'Neto(a)');
    }

    protected function insert($id, $codigo, $name): void
    {
        if (DB::table('aux_kinship')->where('name', $name)->get()->isEmpty()) {
            DB::table('aux_kinship')->insert([
                'id' => $id,
                'codigo' => $codigo,
                'name'      => $name,
            ]);
        }
    }
}
