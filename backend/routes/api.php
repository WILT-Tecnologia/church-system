<?php

use App\Http\Controllers\Api\EventsController;
use App\Http\Controllers\Api\LoginController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [LoginController::class, 'login']);
});

Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout/{user}', [loginController::class, 'logout']);
});

Route::post('/users/{userId}/change-password', [LoginController::class, 'change_password'])->middleware('auth:sanctum');

Route::prefix('admin')->middleware(['cors', 'auth:sanctum'])->group(function () {
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
    Route::apiResource('profiles', \App\Http\Controllers\Api\ProfileController::class);
    Route::apiResource('modules', \App\Http\Controllers\Api\ModuleController::class);
    Route::apiResource('persons', \App\Http\Controllers\Api\PersonController::class);
    Route::apiResource('churches', \App\Http\Controllers\ChurchController::class);
    Route::apiResource('occupations', \App\Http\Controllers\Api\OccupationController::class);
    Route::apiResource('event-types', \App\Http\Controllers\Api\EventTypeController::class);
    Route::apiResource('member-origins', \App\Http\Controllers\Api\MemberOriginController::class);
});

Route::prefix('church')->middleware(['cors', 'auth:sanctum'])->group(function () {
    Route::apiResource('members', \App\Http\Controllers\Api\MemberController::class);
    Route::apiResource('families', \App\Http\Controllers\Api\FamilyController::class);
    Route::apiResource('ordinations', \App\Http\Controllers\Api\OrdinationController::class);
    Route::apiResource('status-members', \App\Http\Controllers\Api\StatusMemberController::class);
    Route::apiResource('hist-member', \App\Http\Controllers\Api\HistMemberController::class);
    Route::apiResource('eventos', \App\Http\Controllers\Api\EventoController::class);
    Route::get('eventos/type/{event_type_id}', [\App\Http\Controllers\Api\EventoController::class, 'getByEventType']);
    Route::post('eventos/{evento}/participants', [\App\Http\Controllers\Api\EventoController::class, 'adicionarParticipante']);
    Route::delete('eventos/{evento}/participants', [\App\Http\Controllers\Api\EventoController::class, 'removerParticipante']);
    Route::post('eventos/{evento}/guests', [\App\Http\Controllers\Api\EventoController::class, 'adicionarConvidado']);
    Route::delete('eventos/{evento}/guests', [\App\Http\Controllers\Api\EventoController::class, 'removerConvidado']);
    Route::apiResource('eventos/{evento}/calls', \App\Http\Controllers\Api\EventCallsController::class);
    Route::apiResource('eventos/{evento}/calls/{eventCall}/frequencies', \App\Http\Controllers\Api\FrequencyController::class)->parameters([
            'evento' => 'eventId',
            'eventCall' => 'eventCallId',
            'frequencies' => 'frequencyId',
        ]);
    Route::apiResource('patrimonies', \App\Http\Controllers\Api\PatrimonyController::class);
    Route::apiResource('suppliers', \App\Http\Controllers\Api\SupplierController::class);
});

Route::prefix('aux')->middleware(['cors', 'auth:sanctum'])->group(function () {
    Route::get('civil-status', [\App\Http\Controllers\Api\Auxiliares\CivilStatusController::class, 'index']);
    Route::get('color-race', [\App\Http\Controllers\Api\Auxiliares\ColorRaceController::class, 'index']);
    Route::get('formations', [\App\Http\Controllers\Api\Auxiliares\FormationController::class, 'index']);
    Route::get('kinships', [\App\Http\Controllers\Api\Auxiliares\KinshipController::class, 'index']);
    Route::get('member-situation', [\App\Http\Controllers\Api\Auxiliares\MemberSituationController::class, 'index']);
});
