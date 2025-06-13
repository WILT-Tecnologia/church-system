<?php

namespace Database\Seeders;

use App\Models\Church;
use App\Models\CivilStatus;
use App\Models\ColorRace;
use App\Models\Formation;
use App\Models\Member;
use App\Models\MemberOrigin;
use App\Models\Person;
use App\Models\User;
use Hash;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class MembersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void {
        $faker = Faker::create('pt_BR');

        $user = User::create([
            'name' => 'Administrador',
            'email' => 'administrador@gmail.com',
            'password' => Hash::make('@mpresaPC10'),
        ]);

        $person = Person::create([
            'user_id' => $user->id,
            'image' => null,
            'name' => 'Administrador',
            'cpf' => '98765432100',
            'birth_date' => '2000-01-01',
            'email' => 'administrador@gmail.com',
            'phone_one' => $faker->phoneNumber(),
            'phone_two' => $faker->phoneNumber(),
            'sex' => 'M',
            'cep' => '76919000',
            'street' => 'Rua Bahia',
            'number' => '123',
            'complement' => 'Casa',
            'district' => 'Centro',
            'city' => 'Ministro Andreazza',
            'state' => 'RO',
            'country' => 'Brasil',
        ]);

        $church = Church::create([
            'responsible_id' => $person->id,
            'name' => 'Assembléia de Deus',
            'email' => 'eiad@gmail.com',
            'cnpj' => '12345678000199',
            'cep' => '76919000',
            'street' => 'Rua Bahia',
            'number' => '123',
            'complement' => 'Casa',
            'district' => 'Centro',
            'city' => 'Ministro Andreazza',
            'state' => 'RO',
            'country' => 'Brasil',
            'logo' => $faker->imageUrl(100, 100, 'logo'),
            'favicon' => $faker->imageUrl(32, 32, 'favicon'),
            'background' => $faker->imageUrl(1920, 1080, 'church'),
            'color' => $faker->hexColor,
        ]);

        $civilStatus = CivilStatus::first();
        $coloRace = ColorRace::first();
        $formation = Formation::first();
        $member_origin = MemberOrigin::first();

        $member = Member::create([
            'person_id' => $person->id,
            'church_id' => $church->id,
            'rg' => '123456789',
            'issuing_body' => 'Orgão Expedidor',
            'civil_status_id' => $civilStatus->id,
            'nationality' => 'Brasileira',
            'naturalness' => 'Brasileiro',
            'color_race_id' => $coloRace->id,
            'formation_id' => $formation->id,
            'formation_course' => null,
            'profission' => null,
            'def_physical' => false,
            'def_visual' => false,
            'def_hearing' => false,
            'def_intellectual' => false,
            'def_mental' => false,
            'def_multiple' => false,
            'def_other' => false,
            'def_other_description' => null,
            'baptism_date' => null,
            'baptism_locale' => null,
            'baptism_official' => null,
            'baptism_holy_spirit' => false,
            'baptism_holy_spirit_date' => null,
            'member_origin_id' => $member_origin->id,
            'receipt_date' => null,
        ]);

        $member->churches()->attach($church->id);
    }
}
