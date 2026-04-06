<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Module;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Permission; // Usando o modelo de Permissão do App\Models
use Illuminate\Support\Str;
use App\Http\Requests\ProfileRequest;

class ProfileController extends Controller
{
    public function __construct(
        private PermissionService $permissionService
    ) {}

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

    public function store(ProfileRequest $request) {

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
                $moduleId = $moduleData['module_id'];

                $module = Module::findOrFail($moduleId);

                $moduleKey = $this->permissionService->permissionKey($module);

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
                    $permissions[] = "read_{$moduleKey}";
                }

                if ($moduleData['can_write'] ?? false) {
                    $permissions[] = "write_{$moduleKey}";
                }

                if ($moduleData['can_delete'] ?? false) {
                    $permissions[] = "delete_{$moduleKey}";
                }
            }

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

    public function update(ProfileRequest $request, string $id) {
        $profile = Profile::find($id);

        if (!$profile) {
            return response()->json([
                'status' => false,
                'message' => 'Perfil não encontrado'
            ], 404);
        }

        DB::beginTransaction();
        try {
            $guardApi = 'sanctum';

            $profile->update($request->only(['name', 'description', 'status', 'guard_name']));

            if ($request->has('modules')) {
                DB::table('profile_modules')->where('profile_id', $profile->id)->delete();

                $permissions = [];
                foreach ($request->modules as $moduleData) {
                    $moduleId = $moduleData['module_id'];

                    $module = Module::findOrFail($moduleId);

                    $moduleKey = $this->permissionService->permissionKey($module);

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
                        $permissions[] = "read_{$moduleKey}";
                    }

                    if ($moduleData['can_write'] ?? false) {
                        $permissions[] = "write_{$moduleKey}";
                    }

                    if ($moduleData['can_delete'] ?? false) {
                        $permissions[] = "delete_{$moduleKey}";
                    }
                }

                foreach ($permissions as $permissionName) {
                    Permission::firstOrCreate(
                        ['name' => $permissionName, 'guard_name' => $guardApi],
                        ['guard_name' => $guardApi]
                    );
                }

                $profile->syncPermissions($permissions);
                app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            }

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
