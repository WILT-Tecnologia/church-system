<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function login(Request $request) {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            if ($user->person) {
                $members = $user->person->member()->with('churches')->get();

                $churches = $members->flatMap(function ($member) {
                    return $member->churches;
                })->unique('id');

                $churchesArray = $churches->toArray();
            } else {
                $churchesArray = [];
            }

            $token = $request->user()->createToken('token')->plainTextToken;

            return response()->json([
                'status' => true,
                'token' => $token,
                'user' => $user,
                'churches' => $churchesArray,
            ], 201);
        } else {
            return response()->json([
                'status' => false,
                'message' => 'Email ou senha inválidos'
            ], 404);
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
}
