<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventoRequest;
use App\Http\Requests\UpdateEventoRequest;
use App\Http\Resources\EventoResource;
use App\Models\Evento;
use Illuminate\Http\Request;

class EventoController extends Controller
{
    public function index() {
        return EventoResource::collection(Evento::with('participantes')->get());
    }

    public function store(StoreEventoRequest $request) {
        $evento = Evento::create($request->validated());
        return new EventoResource($evento);
    }

    public function show(Evento $evento) {
        return new EventoResource($evento->load('participantes'));
    }

    public function update(UpdateEventoRequest $request, Evento $evento) {
        $evento->update($request->validated());
        return new EventoResource($evento);
    }

    public function destroy(Evento $evento) {
        $evento->delete();
        return response()->noContent();
    }

    public function getByEventType($event_type_id, Request $request) {
        $perPage = $request->input('per_page', 25);

        $events = Evento::query()
            ->where('event_type_id', $event_type_id)
            ->with('church', 'eventType')
            ->paginate($perPage);

        return response()->json(EventoResource::collection($events));
    }

    public function adicionarParticipante(Request $request, Evento $evento) {
        $request->validate([
            'member_id' => 'nullable|uuid|exists:members,id',
            'guest_id' => 'nullable|uuid|exists:guests,id',
        ]);

        $id = $request->input('member_id') ?? $request->input('guest_id');
        if (!$id) {
            return response()->json(['message' => 'ID de membro ou convidado é obrigatório'], 422);
        }

        $evento->participantes()->syncWithoutDetaching([$id]);
        return response()->json(['message' => 'Participante adicionado']);
    }

    public function removerParticipante(Request $request, Evento $evento) {
        $request->validate(['member_id' => 'required|uuid|exists:event_participants,member_id']);
        $evento->participantes()->detach($request->member_id);
        return response()->json(['message' => 'Participante removido']);
    }

    public function adicionarConvidado(Request $request, Evento $evento) {
        $request->validate(['person_id' => 'required|uuid|exists:persons,id']);
        // dd($request->member_id)
        $evento->guests()->syncWithoutDetaching($request->person_id);
        // $evento->participantes()->syncWithoutDetaching([$request->participante_id]);
        return response()->json(['message' => 'Convidado adicionado']);
    }

    public function removerConvidado(Request $request, Evento $evento) {
        $request->validate(['person_id' => 'required|uuid|exists:persons,id']);
        $evento->guests()->detach($request->person_id);
        return response()->json(['message' => 'Convidado removido']);
    }
}
