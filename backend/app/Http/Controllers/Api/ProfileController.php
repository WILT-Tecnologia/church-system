<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Models\Profile;
use Request;

class ProfileController extends Controller
{

    public function index() {
        $profile = Profile::orderBy('status', 'desc')->orderBy('name', 'asc')->get();

        return response()->json(ProfileResource::collection($profile));
    }

    public function store(ProfileRequest $request) {
        $data = $request->validated();

        $profile = Profile::create($data);

        return new ProfileResource($profile);
    }

    public function show(Profile $profile) {
        $profile = Profile::findOrFail($profile->id);
        return new ProfileResource($profile);
    }

    public function update(ProfileRequest $request, Profile $profile) {
        $data = $request->validated();

        $profile->update($data);

        return new ProfileResource($profile);
    }

    public function destroy(Profile $profile) {
        $profile->delete();

        return response()->json($profile, 201);
    }
}
