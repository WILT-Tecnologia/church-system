<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventsRequest;
use App\Http\Requests\UpdateEventsRequest;
use App\Http\Resources\EventsResource;
use App\Models\Evento;
use App\Models\Events;
use Illuminate\Http\Request;

class EventsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return EventsResource::collection(Evento::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventsRequest $request)
    {
        $evento = Evento::create($request->validated());

        return new EventsResource($evento);
    }

    /**
     * Display the specified resource.
     */
    public function show(Evento $evento)
    {
        return new EventsResource($evento);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventsRequest $request, Evento $evento)
    {
        $evento->update($request->validated());

        return new EventsResource($evento);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Evento $evento)
    {
        $evento->delete();

        return response()->json([], 204);
    }
}
