<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();

        return response()->json(UserResource::collection($users));

    }

    public function store(UserRequest $request) {
        $data = $request->validated();
        $user = User::create($data);

        return new UserResource($user);
    }

    public function show(User $user) {
        return new UserResource($user);
    }

    public function update(UserRequest $request, User $user) {
        $data = $request->validated();

        $user->update($data);

        return new UserResource($user);
    }

    public function destroy(User $user) {
        $user->delete();

        return response()->json([], 204);
    }
}
