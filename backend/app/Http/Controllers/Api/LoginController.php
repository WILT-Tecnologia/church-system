<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function teste(Request $request)
    {
        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {

            $user = Auth::user();

            $token = $request->user()->createToken('api-token')->plainTextToken;

            return response()->json([
                'status' => true,
                'token' => $token,
                'user' => $user
            ], 201);
        } else {
            return response()->json([
                'status' => false,
                'message' => 'Login or password incorrect'
            ], 404);
        }
    }

    public function logout(User $user)
    {
        try {

            $user->tokens()->delete();

            return response()->json([
                'status' => true,
                'message' => 'Deslogado'
            ],200);
        } catch (Exception $e) {

            return response()->json([
                'status' => false,
                'message' => 'Não deslogado'
            ], 400);
        }
    }
}
