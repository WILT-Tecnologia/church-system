<?php

use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;


Route::post('teste', [LoginController::class, 'teste']);

Route::prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/logout/{user}', [loginController::class, 'logout']);
    Route::apiResource('persons', \App\Http\Controllers\Api\PersonController::class);
    Route::apiResource('churches', \App\Http\Controllers\ChurchController::class);
    Route::apiResource('occupations', \App\Http\Controllers\Api\OccupationController::class);
    Route::apiResource('event-types', \App\Http\Controllers\Api\EventTypeController::class);
    Route::apiResource('member-origins', \App\Http\Controllers\Api\MemberOriginController::class);
});

Route::prefix('church')->group(function () {
    Route::apiResource('members', \App\Http\Controllers\Api\MemberController::class);
    Route::apiResource('families', \App\Http\Controllers\Api\FamilyController::class);
});
