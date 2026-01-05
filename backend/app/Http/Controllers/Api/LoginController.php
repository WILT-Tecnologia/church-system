<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Validator;

class LoginController extends Controller
{
    public function login(Request $request) {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $request->user()->createToken('token')->plainTextToken;

            $churchesArray = [];
            if ($user->person) {
                $members = $user->person->member()->with('churches')->get();

                $churches = $members->flatMap(function ($member) {
                    return $member->churches;
                })->unique('id')->values();

                $churchesArray = $churches->toArray();
            }

            return response()->json([
                'status' => true,
                'token' => $token,
                'user' => $user,
                'churches' => $churchesArray,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ], 201);
        } else {
            return response()->json([
                'status' => false,
                'message' => 'Email ou senha inválidos'
            ], 401);
        }
    }

    public function logout(User $user) {
        try {

            if ($user->tokens()->count() > 0) {
                $user->tokens()->delete();
            }

            return response()->json([
                'status' => true,
                'message' => 'Deslogado'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Não deslogado'
            ], 400);
        }
    }

    public function change_password(Request $request, string $userId) {
        try {
            $user = Auth::user();

            // Check if user is authenticated
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Usuário não autenticado'
                ], 401);
            }

            // Ensure the authenticated user is the same as the user whose password is being changed
            if ($user->id !== $userId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Não autorizado a alterar a senha deste usuário'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'newPassword' => [
                    'required',
                    'string',
                    'min:8',
                    'max:30',
                    'regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,30}$/'
                ],
            ], [
                'newPassword.required' => 'A nova senha é obrigatória.',
                'newPassword.min' => 'A senha deve ter no mínimo 8 caracteres.',
                'newPassword.max' => 'A senha deve ter no máximo 30 caracteres.',
                'newPassword.regex' => 'A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais (@,$,!,%,*,?,&).',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->password = Hash::make($request->newPassword);
            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Senha alterada com sucesso'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Erro ao alterar a senha: ' . $e->getMessage()
            ], 500);
        }
    }
}
