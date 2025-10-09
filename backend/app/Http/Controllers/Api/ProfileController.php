<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Permission; // Usando o modelo de Permissão do App\Models
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    // Função auxiliar para padronizar o nome do módulo, como no seeder
    private function normalizeModuleName(string $name): string {
        $lower = Str::lower($name);
        $cleaned = str_replace([' ', '/', '_'], '_', $lower);
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT', $cleaned);
        return Str::snake($normalized);
    }

    public function index() {
        $profiles = Profile::with(['permissions', 'module'])->orderBy('status', 'desc')->orderBy('name', 'asc')->get();

        $profiles = $profiles->map(function ($profile) {
            return [
                'id' => $profile->id,
                'name' => $profile->name,
                'description' => $profile->description,
                'status' => $profile->status,
                'guard_name' => $profile->guard_name,
                'permissions' => $profile->permissions->pluck('name'),
                'modules' => $profile->module->map(function ($module) {
                    return [
                        'module_id' => $module->id,
                        'module_name' => $module->name,
                        'can_read' => $module->pivot->can_read,
                        'can_write' => $module->pivot->can_write,
                        'can_delete' => $module->pivot->can_delete,
                    ];
                }),
                'created_at' => $profile->created_at,
                'updated_at' => $profile->updated_at,
            ];
        });

        return response()->json($profiles);
    }

    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:profile,name',
            'description' => 'nullable|string',
            'status' => 'boolean',
            'modules' => 'required|array|min:1',
            'modules.*.module_id' => 'required|exists:module,id',
            'modules.*.can_read' => 'boolean',
            'modules.*.can_write' => 'boolean',
            'modules.*.can_delete' => 'boolean',
        ], [
            'name.required' => 'O nome do perfil é obrigatório',
            'name.unique' => 'Já existe um perfil com este nome',
            'modules.required' => 'Selecione ao menos um módulo',
            'modules.min' => 'Selecione ao menos um módulo',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $guardApi = 'sanctum';

            $profile = Profile::create([
                'name' => $request->name,
                'guard_name' => $guardApi,
                'description' => $request->description,
                'status' => $request->status ?? true,
            ]);

            $permissions = [];
            foreach ($request->modules as $moduleData) {
                $module = Module::find($moduleData['module_id']);

                $moduleNameKey = $this->normalizeModuleName($module->name);

                DB::table('profile_modules')->insert([
                    'id' => DB::raw('gen_random_uuid()'),
                    'profile_id' => $profile->id,
                    'module_id' => $module->id,
                    'can_read' => $moduleData['can_read'] ?? false,
                    'can_write' => $moduleData['can_write'] ?? false,
                    'can_delete' => $moduleData['can_delete'] ?? false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if ($moduleData['can_read'] ?? false) {
                    $permissions[] = "read_{$moduleNameKey}";
                }
                if ($moduleData['can_write'] ?? false) {
                    $permissions[] = "write_{$moduleNameKey}";
                }
                if ($moduleData['can_delete'] ?? false) {
                    $permissions[] = "delete_{$moduleNameKey}";
                }
            }

            // CORREÇÃO: Forçar a criação/existência da permissão com o guard correto
            // Se a permissão não existir no guard 'sanctum', ela será criada.
            foreach ($permissions as $permissionName) {
                Permission::firstOrCreate(
                    ['name' => $permissionName, 'guard_name' => $guardApi],
                    ['guard_name' => $guardApi]
                );
            }

            $profile->syncPermissions($permissions);
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Perfil criado com sucesso',
                'data' => $profile->load(['permissions', 'module'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Erro ao criar perfil: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id) {
        $profile = Profile::with(['permissions', 'module'])->find($id);

        if (!$profile) {
            return response()->json([
                'status' => false,
                'message' => 'Perfil não encontrado'
            ], 404);
        }

        return response()->json([
            'id' => $profile->id,
            'name' => $profile->name,
            'description' => $profile->description,
            'status' => $profile->status,
            'guard_name' => $profile->guard_name,
            'permissions' => $profile->permissions->pluck('name'),
            'modules' => $profile->module->map(function ($module) {
                return [
                    'module_id' => $module->id,
                    'module_name' => $module->name,
                    'can_read' => $module->pivot->can_read,
                    'can_write' => $module->pivot->can_write,
                    'can_delete' => $module->pivot->can_delete,
                ];
            }),
            'created_at' => $profile->created_at,
            'updated_at' => $profile->updated_at,
        ]);
    }

    public function update(Request $request, string $id) {
        $profile = Profile::find($id);

        if (!$profile) {
            return response()->json([
                'status' => false,
                'message' => 'Perfil não encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:profile,name,' . $id,
            'description' => 'nullable|string',
            'status' => 'boolean',
            'modules' => 'required|array|min:1',
            'modules.*.module_id' => 'required|exists:module,id',
            'modules.*.can_read' => 'boolean',
            'modules.*.can_write' => 'boolean',
            'modules.*.can_delete' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $guardApi = 'sanctum';

            $profile->update([
                'name' => $request->name,
                'description' => $request->description,
                'status' => $request->status ?? true,
                'guard_name' => $guardApi,
            ]);

            DB::table('profile_modules')->where('profile_id', $profile->id)->delete();

            $permissions = [];
            foreach ($request->modules as $moduleData) {
                $module = Module::find($moduleData['module_id']);

                $moduleNameKey = $this->normalizeModuleName($module->name);

                DB::table('profile_modules')->insert([
                    'id' => DB::raw('gen_random_uuid()'),
                    'profile_id' => $profile->id,
                    'module_id' => $module->id,
                    'can_read' => $moduleData['can_read'] ?? false,
                    'can_write' => $moduleData['can_write'] ?? false,
                    'can_delete' => $moduleData['can_delete'] ?? false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if ($moduleData['can_read'] ?? false) {
                    $permissions[] = "read_{$moduleNameKey}";
                }
                if ($moduleData['can_write'] ?? false) {
                    $permissions[] = "write_{$moduleNameKey}";
                }
                if ($moduleData['can_delete'] ?? false) {
                    $permissions[] = "delete_{$moduleNameKey}";
                }
            }

            // CORREÇÃO: Forçar a criação/existência da permissão com o guard correto
            // Se a permissão não existir no guard 'sanctum', ela será criada.
            foreach ($permissions as $permissionName) {
                Permission::firstOrCreate(
                    ['name' => $permissionName, 'guard_name' => $guardApi],
                    ['guard_name' => $guardApi]
                );
            }

            $profile->syncPermissions($permissions);
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Perfil atualizado com sucesso',
                'data' => $profile->load(['permissions', 'module'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Erro ao atualizar perfil: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id) {
        $profile = Profile::find($id);

        if (!$profile) {
            return response()->json([
                'status' => false,
                'message' => 'Perfil não encontrado'
            ], 404);
        }

        if ($profile->users()->count() > 0) {
            return response()->json([
                'status' => false,
                'message' => 'Não é possível excluir perfil com usuários vinculados'
            ], 400);
        }

        $profile->delete();

        return response()->json([
            'status' => true,
            'message' => 'Perfil excluído com sucesso'
        ]);
    }
}
