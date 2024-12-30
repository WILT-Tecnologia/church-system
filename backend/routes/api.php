<?php

use App\Http\Controllers\Api\LoginController;
use Illuminate\Support\Facades\Route;


Route::post('teste', [LoginController::class, 'teste']);

Route::prefix('admin')->group(function () {
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
    Route::apiResource('profiles', \App\Http\Controllers\Api\ProfileController::class);
    Route::apiResource('permissions', \App\Http\Controllers\Api\PermissionsController::class);
    Route::get('profile/{profile}/permissions', [\App\Http\Controllers\Api\PermissionsController::class, 'showPermissions']);
    Route::post('profile/{profile}/permissions', [\App\Http\Controllers\Api\PermissionsController::class, 'assignPermissions']);
    Route::post('/logout/{user}', [loginController::class, 'logout']);
    Route::apiResource('persons', \App\Http\Controllers\Api\PersonController::class);
    Route::apiResource('churches', \App\Http\Controllers\ChurchController::class);
    Route::apiResource('occupations', \App\Http\Controllers\Api\OccupationController::class);
    Route::apiResource('event-types', \App\Http\Controllers\Api\EventTypeController::class);
    Route::apiResource('member-origins', \App\Http\Controllers\Api\MemberOriginController::class);
});

Route::prefix('church')->group(function () {
    Route::apiResource('members', \App\Http\Controllers\Api\MemberController::class);

    // Rota para buscar famílias de um membro específico
    Route::get('member', [\App\Http\Controllers\Api\MemberController::class, 'findFamilyPerMember']);
    // Rota para buscar ordenações de um membro específico
    Route::get('ordination', [\App\Http\Controllers\Api\MemberController::class, 'findOrdinationPerMember']);

    Route::apiResource('families', \App\Http\Controllers\Api\FamilyController::class);
    Route::apiResource('ordinations', \App\Http\Controllers\Api\OrdinationController::class);
    Route::apiResource('status-members', \App\Http\Controllers\Api\StatusMemberController::class);
    Route::apiResource('hist-member', \App\Http\Controllers\Api\HistMemberController::class);
    Route::get('hist-member/{memberId}', [\App\Http\Controllers\Api\HistMemberController::class, 'show']);
    Route::apiResource('evento', \App\Http\Controllers\Api\EventsController::class);
});

Route::prefix('aux')->group(function () {
    Route::get('civil-status', [\App\Http\Controllers\Api\Auxiliares\CivilStatusController::class, 'index']);
    Route::get('color-race', [\App\Http\Controllers\Api\Auxiliares\ColorRaceController::class, 'index']);
    Route::get('formations', [\App\Http\Controllers\Api\Auxiliares\FormationController::class, 'index']);
    Route::get('kinships', [\App\Http\Controllers\Api\Auxiliares\KinshipController::class, 'index']);
    Route::get('member-situation', [\App\Http\Controllers\Api\Auxiliares\MemberSituationController::class, 'index']);
});
