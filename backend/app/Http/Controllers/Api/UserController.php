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
        $users = [];
        User::with('profile')->chunk(100, function ($chunk) use (&$users) {
            foreach ($chunk as $user) {
                $users[] = new UserResource($user);
            }
        });
        return response()->json($users);

    }

    public function store(UserRequest $request) {
        $data = $request->validated();
        $user = User::create($data);

        if ($request->has('profile')) {
            $user->profiles()->sync($request->profile);
        }

        return new UserResource($user);
    }

    public function show(User $user) {
        return new UserResource($user->load('profile'));
    }

    public function update(UserRequest $request, User $user) {
        $data = $request->validated();

        $user->update($data);

        if ($request->has('profile')) {
            $user->profiles()->sync($request->profile);
        }

        return new UserResource($user);
    }

    public function destroy(User $user) {
        $user->delete();

        return response()->json([], 204);
    }
}
