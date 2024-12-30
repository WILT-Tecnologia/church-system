<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermissionRequest;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use App\Models\Profile;
use Illuminate\Http\Request;

class PermissionsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Permission::all());
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(PermissionRequest $request)
    {
        $data = $request->validated();

        $permission = Permission::create($data);

        return response()->json($permission);
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission)
    {
        return new PermissionResource($permission);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PermissionRequest $request, Permission $permission)
    {
        $data = $request->validated();

        $permission->update($data);

        return new PermissionResource($permission);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permissions)
    {
        $permissions->delete();

        return response()->json([], 204);
    }

    public function showPermissions(Profile $profile)
    {
        // Carregar as permissões associadas ao perfil
        $permissions = $profile->permissions;

        // Retornar as permissões em formato JSON
        return response()->json($permissions);
    }

    public function assignPermissions(Request $request, Profile $profile)
    {
        // Validar as permissões passadas na requisição
        $request->validate([
            'permissions' => 'required|array',  // Validar que 'permissions' é um array
            'permissions.*' => 'exists:permissions,id',  // Verificar se cada permission_id existe
        ]);

        // Associar permissões ao perfil
        $profile->permissions()->sync($request->permissions);

        // Retornar resposta
        return response()->json(['message' => 'Permissões associadas com sucesso!']);
    }
}
