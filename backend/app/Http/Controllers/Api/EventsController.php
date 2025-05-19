<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventsRequest;
use App\Http\Requests\UpdateEventsRequest;
use App\Http\Resources\EventsResource;
use App\Models\Evento;
use App\Models\Events;
use App\Models\EventType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventsController extends Controller
{
    public function index(): JsonResponse {
        $events = Evento::query()
            ->orderBy('start_date', 'asc')
            ->with(['eventType', 'church', 'createdBy', 'updatedBy'])
            ->get();

        return response()->json(EventsResource::collection($events));
    }


    public function store(StoreEventsRequest $request) {
        $evento = Evento::create($request->validated());

        return new EventsResource($evento);
    }

    public function show(Evento $evento) {
        return new EventsResource($evento);
    }

    public function update(UpdateEventsRequest $request, Evento $evento) {
        $evento->update($request->validated());

        return new EventsResource($evento);
    }

    public function destroy(Evento $evento) {
        $evento->delete();

        return response()->json([], 204);
    }

    /**
     * Get events by event type ID with status = true.
     *
     * @param $event_type_id
     * @param EventType $eventType
     * @param Request $request
     * @return JsonResponse
     */
    public function getByEventType($event_type_id, EventType $eventType, Request $request): JsonResponse {
        $perPage = $request->input('per_page', 25);

        $events = Evento::query()
            ->where('event_type_id', $event_type_id)
            ->with(['eventType', 'church', 'createdBy', 'updatedBy'])
            ->orderBy('start_date', 'asc')
            ->paginate($perPage);

        return response()->json(EventsResource::collection($events));
    }
}
