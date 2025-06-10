<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventsRequest;
use App\Http\Requests\UpdateEventsRequest;
use App\Http\Resources\EventsResource;
use App\Models\Evento;
use App\Models\EventType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventsController extends Controller
{
    /**
     * Retrieve a list of events.
     *
     * @return JsonResponse
     * */
    public function index(): JsonResponse {
        $events = Evento::query()
            ->with('church', 'eventType')
            ->get();

        return response()->json(EventsResource::collection($events));
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param StoreEventsRequest $request the request containing the event data to be stored
     * @return EventsResource
     */
    public function store(StoreEventsRequest $request) {
        $evento = Evento::create($request->validated());

        return new EventsResource($evento);
    }


    /**
     * Display the specified event.
     *
     * @param Evento $evento the object representing the event to be displayed
     * @return EventsResource
     */

    public function show(Evento $evento) {
        return new EventsResource($evento);
    }

    /**
     * Update the specified event in storage.
     *
     * @param UpdateEventsRequest $request the request containing the updated event data
     * @param Evento $evento the object representing the event to be updated
     * @return EventsResource
     */
    public function update(UpdateEventsRequest $request, Evento $evento) {
        $data = $request->validated();

        $evento->update($data);

        return new EventsResource($evento);
    }

    /**
     * Remove the specified event from storage.
     *
     * @param Evento $evento the object representing the event to be deleted
     * @return JsonResponse
     */

    public function destroy(Evento $evento) {
        $evento->delete();

        return response()->json([], 204);
    }


    /**
     * Retrieve a paginated list of events by event type.
     *
     * @param string $event_type_id The ID of the event type to filter events by.
     * @param Request $request The HTTP request instance.
     * @return JsonResponse A JSON response containing a collection of events.
     */

    public function getByEventType($event_type_id, Request $request): JsonResponse {
        $perPage = $request->input('per_page', 25);

        $events = Evento::query()
            ->where('event_type_id', $event_type_id)
            ->with('church', 'eventType')
            ->paginate($perPage);

        return response()->json(EventsResource::collection($events));
    }
}
