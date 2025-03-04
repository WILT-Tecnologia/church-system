<?php

namespace Database\Seeders\Auxiliar;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MemberSituationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->insert(Str::uuid(), '01', 'Membro ativo');
        $this->insert(Str::uuid(), '02', 'Frequentador');
        $this->insert(Str::uuid(), '03', 'Membro em disciplina');
        $this->insert(Str::uuid(), '04', 'Inativo');
        $this->insert(Str::uuid(), '05', 'Falecido');
    }

    protected function insert($id, $codigo, $name): void
    {
        if (DB::table('aux_member_situation')->where('name', $name)->get()->isEmpty()) {
            DB::table('aux_member_situation')->insert([
                'id' => $id,
                'codigo' => $codigo,
                'name'      => $name,
            ]);
        }
    }
}
