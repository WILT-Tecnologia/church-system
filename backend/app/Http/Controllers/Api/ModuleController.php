<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ModuleRequest;
use App\Http\Resources\ModuleResource;
use App\Models\Module;
use App\Models\Profile;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index()
    {
        return response()->json(Module::all());
    }

    public function store(ModuleRequest $request)
    {
        $data = $request->validated();

        $permission = Module::create($data);

        return response()->json($permission);
    }

    public function show(Module $module)
    {
        return new ModuleResource($module);
    }

    public function update(ModuleRequest $request, Module $permission)
    {
        $data = $request->validated();

        $permission->update($data);

        return new ModuleResource($permission);
    }

    public function destroy(Module $permissions)
    {
        $permissions->delete();

        return response()->json([], 204);
    }

    public function showPermissions(Profile $profile)
    {
        $permissions = $profile->permissions;

        return response()->json($permissions);
    }
}
