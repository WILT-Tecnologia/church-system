<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Module;
use App\Models\Profile;
use App\Models\ProfileModule;
use App\Models\User;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    private function normalizeModuleName(string $name): string {
        // 1. Converte para minúsculas
        $lower = Str::lower($name);

        // 2. Substitui barras e espaços por sublinhado ANTES de remover acentos.
        $cleaned = str_replace([' ', '/'], '_', $lower);

        // 3. Remove acentos e normaliza
        // Nota: O ícone é usado para remover acentos de forma robusta.
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT', $cleaned);

        // 4. Aplica Str::snake() no resultado final (mantido por segurança)
        return Str::snake($normalized);
    }

    public function run() {
        $guardApi = 'sanctum';

        $adminProfile = Profile::firstOrCreate(
            [
                'name' => 'Administrador',
                'guard_name' => $guardApi,
            ],
            [
                'description' => 'Perfil com permissões completas',
                'status' => true,
            ]
        );

        $adminUser = User::where('email', 'administrador@gmail.com')->firstOrFail();

        $modules = Module::all();
        foreach ($modules as $module) {
            $guard = $guardApi;
            $moduleKey = $this->normalizeModuleName($module->name);

            // Criação das Permissões (Read, Write, Delete)
            Permission::findOrCreate("read_{$moduleKey}", $guard);
            Permission::findOrCreate("write_{$moduleKey}", $guard);
            Permission::findOrCreate("delete_{$moduleKey}", $guard);

            // Atribuição total no ProfileModule para o Administrador
            ProfileModule::firstOrCreate(
                [
                    'profile_id' => $adminProfile->id,
                    'module_id' => $module->id,
                ],
                [
                    'can_read' => true,
                    'can_write' => true,
                    'can_delete' => true,
                ]
            );
        }

        // SINCRONIZAÇÃO ESSENCIAL: Atribui TODAS as permissões criadas ao perfil Administrador
        $allPermissions = Permission::all()->pluck('name')->toArray();
        $adminProfile->syncPermissions($allPermissions);
        $adminUser->assignRole($adminProfile);

        // Atualiza tabela pivot user_profile (necessário por usar UUIDs)
        \DB::table('user_profile')
            ->where('model_id', $adminUser->id)
            ->where('model_type', User::class)
            ->where('profile_id', $adminProfile->id)
            ->update(['user_id' => $adminUser->id]);

        // Sincronização de perfis não-administradores
        $profiles = Profile::where('name', '!=', 'Administrador')->get();
        foreach ($profiles as $profile) {
            $modules = $profile->module()->get();
            foreach ($modules as $module) {
                $pivot = ProfileModule::where('profile_id', $profile->id)
                    ->where('module_id', $module->id)
                    ->first();
                if ($pivot) {
                    $moduleKey = $this->normalizeModuleName($module->name);

                    if ($pivot->can_read) {
                        $profile->givePermissionTo("read_{$moduleKey}");
                    }
                    if ($pivot->can_write) {
                        $profile->givePermissionTo("write_{$moduleKey}");
                    }
                    if ($pivot->can_delete) {
                        $profile->givePermissionTo("delete_{$moduleKey}");
                    }
                }
            }
        }

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
