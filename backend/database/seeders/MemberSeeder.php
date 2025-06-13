<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('members')->insert([
            'id' => Str::uuid(),
            'person_id' => DB::table('persons')->inRandomOrder()->value('id'),
            'church_id' => DB::table('churches')->inRandomOrder()->value('id'),
            'rg' => '123456789',
            'issuing_body' => 'SSP',
            'civil_status_id' => DB::table('aux_civil_status')->inRandomOrder()->value('id'),
            'nationality' => 'Brasileira',
            'naturalness' => 'São Paulo',
            'color_race_id' => DB::table('aux_color_race')->inRandomOrder()->value('id'),
            'formation_id' => DB::table('aux_formation')->inRandomOrder()->value('id'),
            'formation_course' => 'Engenharia de Software',
            'profission' => 'Desenvolvedor',
            'def_physical' => false,
            'def_visual' => false,
            'def_hearing' => false,
            'def_intellectual' => false,
            'def_mental' => false,
            'def_multiple' => false,
            'def_other' => false,
            'def_other_description' => null,
            'baptism_date' => Carbon::parse('2010-05-15'),
            'baptism_locale' => 'Igreja Central',
            'baptism_official' => 'Pr. João',
            'baptism_holy_spirit' => true,
            'baptism_holy_spirit_date' => Carbon::parse('2012-07-20'),
            'member_origin_id' => DB::table('member_origins')->inRandomOrder()->value('id'),
            'receipt_date' => Carbon::parse('2010-05-20'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
