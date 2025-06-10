<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventCallsRequest;
use App\Http\Requests\UpdateEventCallsRequest;
use App\Http\Resources\EventCallsResource;
use App\Models\EventCalls;

class EventCallsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() {
        return EventCallsResource::collection(EventCalls::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventCallsRequest $request) {
        $eventCall = EventCalls::create($request->validated());

        return new EventCallsResource($eventCall);
    }

    /**
     * Display the specified resource.
     */
    public function show(EventCalls $eventCall) {
        return new EventCallsResource($eventCall);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventCallsRequest $request, EventCalls $eventCall) {
        $eventCall->update($request->validated());

        return new EventCallsResource($eventCall);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EventCalls $eventCall) {
        $eventCall->delete();

        return response()->json([], 204);
    }
}
