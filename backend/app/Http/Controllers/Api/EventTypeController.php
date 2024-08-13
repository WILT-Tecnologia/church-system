<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventTypeRequest;
use App\Http\Requests\UpdateEventTypeRequest;
use App\Http\Resources\EventTypeResource;
use App\Models\EventType;
use Illuminate\Http\Request;

class EventTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return EventTypeResource::collection(EventType::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventTypeRequest $request)
    {
        $eventType = EventType::create($request->validated());

        return new EventTypeResource($eventType);
    }

    /**
     * Display the specified resource.
     */
    public function show(EventType $eventType)
    {
        return new EventTypeResource($eventType);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventTypeRequest $request, EventType $eventType)
    {
        $eventType->update($request->validated());

        return new EventTypeResource($eventType);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EventType $eventType)
    {
        $eventType->delete();

        return response()->json([], 204);
    }
}
