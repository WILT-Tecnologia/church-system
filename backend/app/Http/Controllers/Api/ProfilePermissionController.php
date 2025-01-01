<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Profile;
use Illuminate\Http\Request;

class ProfilePermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Profile $profile)
    {
        return response()->json($profile->module()->withPivot(['can_read', 'can_write', 'can_delete'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Profile $profile, Module $module)
    {
        $profile->module()->updateExistingPivot($module->id, $request->only(['can_read', 'can_write', 'can_delete']));
        return response()->json($profile);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
