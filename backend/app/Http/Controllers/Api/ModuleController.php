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
        $modules = Module::all();
        return response()->json(ModuleResource::collection($modules));
    }

    public function store(ModuleRequest $request)
    {
        $data = $request->validated();

        $module = Module::create($data);

        return response()->json($module);
    }

    public function show(Module $module)
    {
        return new ModuleResource($module);
    }

    public function update(ModuleRequest $request, Module $module)
    {
        $data = $request->validated();

        $module->update($data);

        return new ModuleResource($module);
    }

    public function destroy(Module $module)
    {
        $module->delete();

        return response()->json($module, 201);
    }
}
