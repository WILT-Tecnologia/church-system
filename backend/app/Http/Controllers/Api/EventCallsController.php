<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventCallsRequest;
use App\Http\Requests\UpdateEventCallsRequest;
use App\Http\Resources\EventCallsResource;
use App\Models\EventCall;

class EventCallsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() {
        $eventCalls = EventCall::all();
        return EventCallsResource::collection($eventCalls);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventCallsRequest $request) {
        $eventCall = EventCall::create($request->validated());

        return new EventCallsResource($eventCall);
    }

    /**
     * Display the specified resource.
     */
    public function show(EventCall $eventCall) {
        return new EventCallsResource($eventCall);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventCallsRequest $request, EventCall $eventCall) {
        $eventCall->update($request->validated());

        return new EventCallsResource($eventCall);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EventCall $eventCall) {
        $eventCall->delete();

        return response()->json([], 204);
    }
}
