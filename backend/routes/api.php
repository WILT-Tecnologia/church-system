<?php

use App\Http\Controllers\Api\LoginController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [LoginController::class, 'login']);
});

Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout/{user}', [LoginController::class, 'logout']);
    Route::post('/users/{userId}/change-password', [LoginController::class, 'change_password']);
    Route::get('/user/permissions', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    });
});

Route::prefix('admin')->middleware(['cors', 'auth:sanctum'])->group(function () {
    $permissions_dashboard = 'read_administrative_dashboard_administrativo';
    $permissions_users = 'read_administrative_usuarios|write_administrative_usuarios|delete_administrative_usuarios';
    $permissions_profiles = 'read_administrative_perfis|write_administrative_perfis|delete_administrative_perfis';
    $permissions_modules = 'read_administrative_modulos|write_administrative_modulos|delete_administrative_modulos';
    $permissions_persons = 'read_administrative_pessoas|write_administrative_pessoas|delete_administrative_pessoas|read_church_convidados_e_visitantes|write_church_convidados_e_visitantes|delete_church_convidados_e_visitantes';
    $permissions_churches = 'read_administrative_igrejas|write_administrative_igrejas|delete_administrative_igrejas';
    $permissions_occupations = 'read_administrative_cargos_ministeriais|write_administrative_cargos_ministeriais|delete_administrative_cargos_ministeriais';
    $permissions_event_types = 'read_administrative_tipos_de_eventos|write_administrative_tipos_de_eventos|delete_administrative_tipos_de_eventos';
    $permissions_member_origins = 'read_administrative_origem_do_membro|write_administrative_origem_do_membro|delete_administrative_origem_do_membro';

    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class)->middleware("permission:{$permissions_users}");
    Route::apiResource('profiles', \App\Http\Controllers\Api\ProfileController::class)->middleware("permission:{$permissions_profiles}");
    Route::apiResource('modules', \App\Http\Controllers\Api\ModuleController::class)->middleware("permission:{$permissions_modules}");
    Route::apiResource('persons', \App\Http\Controllers\Api\PersonController::class)->middleware("permission:{$permissions_persons}");
    Route::apiResource('churches', \App\Http\Controllers\ChurchController::class)->middleware("permission:{$permissions_churches}");
    Route::apiResource('occupations', \App\Http\Controllers\Api\OccupationController::class)->middleware("permission:{$permissions_occupations}");
    Route::apiResource('event-types', \App\Http\Controllers\Api\EventTypeController::class)->middleware("permission:{$permissions_event_types}");
    Route::apiResource('member-origins', \App\Http\Controllers\Api\MemberOriginController::class)->middleware("permission:{$permissions_member_origins}");
    Route::get('dashboard', fn() => response()->json(['message' => 'Dashboard Data']))->middleware("permission:{$permissions_dashboard}");
});


Route::prefix('church')->middleware(['cors', 'auth:sanctum'])->group(function () {
    $permissions_members = 'read_church_membros|write_church_membros|delete_church_membros';
    $permissions_events = 'read_church_eventos|write_church_eventos|delete_church_eventos';
    $permissions_tasks = 'read_church_tasks|write_church_tasks|delete_church_tasks';
    $permissions_financial = 'read_church_financeiro|write_church_financeiro|delete_church_financeiro';
    $permissions_patrimony = 'read_church_patrimonios|write_church_patrimonios|delete_church_patrimonios';
    $permissions_suppliers = 'read_church_fornecedores|write_church_fornecedores|delete_church_fornecedores';
    $permissions_financial_categories = 'read_church_categorias_financeiras|write_church_categorias_financeiras|delete_church_categorias_financeiras';
    $permissions_financial_transactions = 'read_church_lancamentos_financeiros|write_church_lancamentos_financeiros|delete_church_lancamentos_financeiros';

    Route::apiResource('members', \App\Http\Controllers\Api\MemberController::class)->middleware("permission:{$permissions_members}");
    Route::apiResource('families', \App\Http\Controllers\Api\FamilyController::class)->middleware("permission:{$permissions_members}");
    Route::apiResource('ordinations', \App\Http\Controllers\Api\OrdinationController::class)->middleware("permission:{$permissions_members}");
    Route::apiResource('status-members', \App\Http\Controllers\Api\StatusMemberController::class)->middleware("permission:{$permissions_members}");
    Route::apiResource('hist-member', \App\Http\Controllers\Api\HistMemberController::class)->middleware("permission:{$permissions_members}");
    Route::apiResource('eventos', \App\Http\Controllers\Api\EventoController::class)->middleware("permission:{$permissions_events}");
    Route::get('eventos/type/{event_type_id}', [\App\Http\Controllers\Api\EventoController::class, 'getByEventType'])->middleware("permission:{$permissions_events}");
    Route::post('eventos/{evento}/participants', [\App\Http\Controllers\Api\EventoController::class, 'adicionarParticipante'])->middleware("permission:{$permissions_events}");
    Route::delete('eventos/{evento}/participants', [\App\Http\Controllers\Api\EventoController::class, 'removerParticipante'])->middleware("permission:{$permissions_events}");
    Route::post('eventos/{evento}/guests', [\App\Http\Controllers\Api\EventoController::class, 'adicionarConvidado'])->middleware("permission:{$permissions_events}");
    Route::delete('eventos/{evento}/guests', [\App\Http\Controllers\Api\EventoController::class, 'removerConvidado'])->middleware("permission:{$permissions_events}");
    Route::apiResource('eventos/{evento}/calls', \App\Http\Controllers\Api\EventCallsController::class)->middleware("permission:{$permissions_events}");
    Route::apiResource('eventos/{evento}/calls/{eventCall}/frequencies', \App\Http\Controllers\Api\FrequencyController::class)->parameters([
        'evento' => 'eventId',
        'eventCall' => 'eventCallId',
        'frequencies' => 'frequencyId',
    ])->middleware("permission:{$permissions_events}");
    Route::apiResource('patrimonies', \App\Http\Controllers\Api\PatrimonyController::class)->middleware("permission:{$permissions_patrimony}");
    Route::apiResource('suppliers', \App\Http\Controllers\Api\SupplierController::class)->middleware("permission:{$permissions_suppliers}");
    Route::apiResource('financial-categories', \App\Http\Controllers\Api\FinancialCategoryController::class)->middleware("permission:{$permissions_financial_categories}");
    route::apiResource('financial-transactions', \App\Http\Controllers\Api\FinancialTransactionController::class)->middleware("permission:{$permissions_financial_transactions}");
});

Route::prefix('aux')->middleware(['cors', 'auth:sanctum'])->group(function () {
    Route::get('civil-status', [\App\Http\Controllers\Api\Auxiliares\CivilStatusController::class, 'index']);
    Route::get('color-race', [\App\Http\Controllers\Api\Auxiliares\ColorRaceController::class, 'index']);
    Route::get('formations', [\App\Http\Controllers\Api\Auxiliares\FormationController::class, 'index']);
    Route::get('kinships', [\App\Http\Controllers\Api\Auxiliares\KinshipController::class, 'index']);
    Route::get('member-situation', [\App\Http\Controllers\Api\Auxiliares\MemberSituationController::class, 'index']);
});
