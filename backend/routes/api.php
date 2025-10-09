<?php

use App\Http\Controllers\Api\EventsController;
use App\Http\Controllers\Api\LoginController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [LoginController::class, 'login']);
});

Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout/{user}', [loginController::class, 'logout']);
    Route::post('/users/{userId}/change-password', [LoginController::class, 'change_password']);
    Route::get('/user/permissions', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    });
});

//----------------------------------------------------------------------------------

Route::prefix('admin')->middleware(['cors', 'auth:sanctum'])->group(function () {
    // Permissões Administrativas
    $permissions_dashboard = 'read_dashboard';
    $permissions_users = 'read_usuarios|write_usuarios|delete_usuarios';
    $permissions_profiles = 'read_perfis|write_perfis|delete_perfis';
    $permissions_permissions = 'read_permissoes|write_permissoes|delete_permissoes';
    $permissions_persons = 'read_pessoas|write_pessoas|delete_pessoas';
    $permissions_churches = 'read_igrejas|write_igrejas|delete_igrejas';
    $permissions_occupations = 'read_cargos_ministeriais|write_cargos_ministeriais|delete_cargos_ministeriais';
    $permissions_event_types = 'read_tipos_de_eventos|write_tipos_de_eventos|delete_tipos_de_eventos';
    $permissions_member_origins = 'read_origem_do_membro|write_origem_do_membro|delete_origem_do_membro';

    // Rotas de Recursos
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class)->middleware("permission:{$permissions_users}");
    Route::apiResource('profiles', \App\Http\Controllers\Api\ProfileController::class)->middleware("permission:{$permissions_profiles}");
    Route::apiResource('modules', \App\Http\Controllers\Api\ModuleController::class)->middleware("permission:{$permissions_permissions}");
    Route::apiResource('persons', \App\Http\Controllers\Api\PersonController::class)->middleware("permission:{$permissions_persons}");
    Route::apiResource('churches', \App\Http\Controllers\ChurchController::class)->middleware("permission:{$permissions_churches}");
    Route::apiResource('occupations', \App\Http\Controllers\Api\OccupationController::class)->middleware("permission:{$permissions_occupations}");
    Route::apiResource('event-types', \App\Http\Controllers\Api\EventTypeController::class)->middleware("permission:{$permissions_event_types}");
    Route::apiResource('member-origins', \App\Http\Controllers\Api\MemberOriginController::class)->middleware("permission:{$permissions_member_origins}");

    // Rota da Dashboard (somente leitura/visualização)
    Route::get('dashboard', fn() => response()->json(['message' => 'Dashboard Data']))->middleware("permission:{$permissions_dashboard}");
});

//----------------------------------------------------------------------------------

Route::prefix('church')->middleware(['cors', 'auth:sanctum'])->group(function () {
    // Permissões da Igreja
    $permissions_members = 'read_membros|write_membros|delete_membros';
    $permissions_guests = 'read_convidados_e_visitantes|write_convidados_e_visitantes|delete_convidados_e_visitantes';
    $permissions_events = 'read_eventos|write_eventos|delete_eventos';
    $permissions_tasks = 'read_tasks|write_tasks|delete_tasks';
    $permissions_financial = 'read_financeiro|write_financeiro|delete_financeiro';
    $permissions_patrimony = 'read_patrimonies|write_patrimonies|delete_patrimonies';

    // Rotas de Recursos
    Route::apiResource('members', \App\Http\Controllers\Api\MemberController::class)->middleware("permission:{$permissions_members}");

    // Rotas de Guests (Convidados / Visitantes)
    // Se 'guests' for um módulo/view separado no Angular, precisamos de uma rota principal.
    // Assumindo que o index/show de guests existe separadamente:
    /* Route::get('guests', [\App\Http\Controllers\Api\GuestController::class, 'index'])->middleware("permission:read_convidados_e_visitantes"); */

    // Rotas secundárias ligadas a Membros
    Route::apiResource('families', \App\Http\Controllers\Api\FamilyController::class)->middleware("permission:read_membros");
    Route::apiResource('ordinations', \App\Http\Controllers\Api\OrdinationController::class)->middleware("permission:read_membros");
    Route::apiResource('status-members', \App\Http\Controllers\Api\StatusMemberController::class)->middleware("permission:read_membros");
    Route::apiResource('hist-member', \App\Http\Controllers\Api\HistMemberController::class)->middleware("permission:read_membros");

    // Rotas de Eventos
    Route::apiResource('eventos', \App\Http\Controllers\Api\EventoController::class)->middleware("permission:{$permissions_events}");

    // Rotas específicas de Eventos
    Route::get('eventos/type/{event_type_id}', [\App\Http\Controllers\Api\EventoController::class, 'getByEventType'])->middleware('permission:read_eventos');

    // AÇÕES DE PARTICIPANTES E GUESTS (PROTEGIDAS por write_eventos)
    Route::post('eventos/{evento}/participants', [\App\Http\Controllers\Api\EventoController::class, 'adicionarParticipante'])->middleware('permission:write_eventos');
    Route::delete('eventos/{evento}/participants', [\App\Http\Controllers\Api\EventoController::class, 'removerParticipante'])->middleware('permission:write_eventos');
    Route::post('eventos/{evento}/guests', [\App\Http\Controllers\Api\EventoController::class, 'adicionarConvidado'])->middleware('permission:write_eventos');
    Route::delete('eventos/{evento}/guests', [\App\Http\Controllers\Api\EventoController::class, 'removerConvidado'])->middleware('permission:write_eventos');

    // Rotas Aninhadas de Eventos (calls/frequencies)
    Route::apiResource('eventos/{evento}/calls', \App\Http\Controllers\Api\EventCallsController::class)->middleware('permission:write_eventos');
    Route::apiResource('eventos/{evento}/calls/{eventCall}/frequencies', \App\Http\Controllers\Api\FrequencyController::class)->parameters([
        'evento' => 'eventId',
        'eventCall' => 'eventCallId',
        'frequencies' => 'frequencyId',
    ])->middleware('permission:write_eventos');

    Route::apiResource('patrimonies', \App\Http\Controllers\Api\PatrimonyController::class)->middleware("permission:{$permissions_patrimony}");

    // Se o módulo Tasks tiver um controller, adicione-o aqui
    // Route::apiResource('tasks', \App\Http\Controllers\Api\TaskController::class)->middleware("permission:{$permissions_tasks}");
    // Se o módulo Financial tiver um controller, adicione-o aqui
    // Route::apiResource('financial', \App\Http\Controllers\Api\FinancialController::class)->middleware("permission:{$permissions_financial}");
});

//----------------------------------------------------------------------------------

Route::prefix('aux')->middleware(['cors', 'auth:sanctum'])->group(function () {
    // Rotas Auxiliares não precisam de permissões específicas, apenas autenticação (auth:sanctum)
    Route::get('civil-status', [\App\Http\Controllers\Api\Auxiliares\CivilStatusController::class, 'index']);
    Route::get('color-race', [\App\Http\Controllers\Api\Auxiliares\ColorRaceController::class, 'index']);
    Route::get('formations', [\App\Http\Controllers\Api\Auxiliares\FormationController::class, 'index']);
    Route::get('kinships', [\App\Http\Controllers\Api\Auxiliares\KinshipController::class, 'index']);
    Route::get('member-situation', [\App\Http\Controllers\Api\Auxiliares\MemberSituationController::class, 'index']);
});
