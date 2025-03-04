<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventParticipanteRequest;
use App\Http\Requests\UpdateEventParticipanteRequest;
use App\Http\Resources\EventParticipantResource;
use App\Models\EventParticipant;
use Illuminate\Http\Request;

class EventParticipantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return EventParticipantResource::collection(EventParticipant::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventParticipanteRequest $request)
    {
        $eventParticipant = EventParticipant::create($request->validated());

        return new EventParticipantResource($eventParticipant);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $eventParticipant = EventParticipant::findOrFail($id);
        return new EventParticipantResource($eventParticipant);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventParticipanteRequest $request, $id)
    {
        $eventParticipant = EventParticipant::findOrFail($id);
        $eventParticipant->update($request->validated());

        return new EventParticipantResource($eventParticipant);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $eventParticipant = EventParticipant::findOrFail($id);
        $eventParticipant->delete();

        return response()->json([], 204);
    }
}
