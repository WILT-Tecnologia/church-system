<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Models\Profile;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $profile = Profile::with('permissions')->orderBy('status','desc')->orderBy('name','asc')->get();

        return response()->json(ProfileResource::collection($profile));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProfileRequest $request)
    {
        $data = $request->validated();

        $profile = Profile::create($data);

        $permissions = collect($data['permissions'])->pluck('id');

        $profile->permissions()->sync($permissions);

        return new ProfileResource($profile);
    }

    /**
     * Display the specified resource.
     */
    public function show(Profile $profile)
    {
        return new ProfileResource($profile);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProfileRequest $request, Profile $profile)
    {
        $data = $request->validated();

        $profile->update($data);

        $permissions = collect($data['permissions'])->pluck('id');

        $profile->permissions()->sync($permissions);

        return new ProfileResource($profile);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Profile $profile)
    {
        $profile->delete();

        return response()->json([], 204);
    }
}
