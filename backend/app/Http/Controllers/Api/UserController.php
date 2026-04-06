<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Exception;
use Illuminate\Validation\Rule;
use App\Http\Requests\UserRequest;

class UserController extends Controller
{
    public function index() {
        $users = User::with('profile')->orderBy('status', 'desc')->orderBy('name', 'asc')->get();

        $users = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'change_password' => $user->change_password,
                'profile_id' => $user->profile->pluck('id')->first(), // Supondo 1 perfil por usuário
                'profile_name' => $user->profile->pluck('name')->first(),
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];
        });

        return response()->json($users);
    }

    public function store(UserRequest $request) {

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'status' => $request->status ?? true,
                'change_password' => $request->change_password ?? true,
            ]);

            $profile = Profile::findOrFail($request->profile_id);
            $user->assignRole($profile);

            return response()->json(['status' => true, 'message' => 'Usuário criado com sucesso', 'data' => $user], 201);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Erro ao criar usuário: ' . $e->getMessage()], 500);
        }
    }

    public function show(string $id) {
        $user = User::with('profile')->find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Usuário não encontrado'], 404);
        }

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'change_password' => $user->change_password,
            'profile_id' => $user->profile->pluck('id')->first(),
            'profile_name' => $user->profile->pluck('name')->first(),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];

        return response()->json($userData);
    }

    public function update(UserRequest $request, string $id) {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Usuário não encontrado'], 404);
        }

        try {
            $data = $request->only(['name', 'email', 'status', 'change_password']);

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            if ($request->filled('profile_id')) {
                $profile = Profile::findOrFail($request->profile_id);
                $user->syncRoles([$profile]); // Sincroniza o perfil
            }

            return response()->json(['status' => true, 'message' => 'Usuário atualizado com sucesso', 'data' => $user], 200);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Erro ao atualizar usuário: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(string $id) {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Usuário não encontrado'], 404);
        }

        $user->delete();

        return response()->json(['status' => true, 'message' => 'Usuário excluído com sucesso'], 204);
    }
}
