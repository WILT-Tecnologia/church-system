<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventCallsRequest;
use App\Http\Requests\UpdateEventCallsRequest;
use App\Http\Resources\EventCallsResource;
use App\Models\EventCall;
use App\Models\Evento;

class EventCallsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Evento $evento) {
        $eventCalls = EventCall::where('event_id', $evento->id)->get();
        return EventCallsResource::collection($eventCalls);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventCallsRequest $request, Evento $evento) {
        $data = $request->validated();
        $data['event_id'] = $evento->id;
        $eventCall = EventCall::create($data);

        return new EventCallsResource($eventCall);
    }

    /**
     * Display the specified resource.
     */
    public function show(Evento $evento,EventCall $eventCall) {
        if ($eventCall->event_id !== $evento->id) {
            return response()->json(['error' => 'Chamada não encontrada para este evento'], 404);
        }
        return new EventCallsResource($eventCall);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventCallsRequest $request, Evento $evento, $eventCall)
    {
        // Busca a chamada explicitamente com base no event_id
        $eventCall = EventCall::where('event_id', $evento->id)
                              ->where('id', $eventCall)
                              ->firstOrFail();

        $eventCall->update($request->validated());

        return new EventCallsResource($eventCall);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Evento $evento, $eventCall)
    {
        // Busca a chamada explicitamente com base no event_id
        $eventCall = EventCall::where('event_id', $evento->id)
                              ->where('id', $eventCall)
                              ->firstOrFail();

        $eventCall->delete();

        return response()->json([], 204);
    }
}
