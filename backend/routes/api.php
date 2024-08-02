<?php

use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('teste', [LoginController::class, 'teste']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/logout/{user}', [loginController::class, 'logout']);
    Route::apiResource('persons', \App\Http\Controllers\Api\PersonController::class);
    Route::apiResource('churches', \App\Http\Controllers\ChurchController::class);
});
