<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFrequencyRequest;
use App\Http\Requests\UpdateFrequencyRequest;
use App\Http\Resources\FrequencyResource;
use App\Models\Frequency;
use Illuminate\Http\Request;

class FrequencyController extends Controller
{
    public function index($eventoId, $eventCallId) {
        $frequencies = Frequency::with(['eventCall.evento', 'member', 'guest'])
            ->where('event_call_id', $eventCallId)
            ->get();

        return FrequencyResource::collection($frequencies);
    }

    public function store(StoreFrequencyRequest $request, $eventoId, $eventCallId) {
        $request->merge(['event_call_id' => $eventCallId]);
        $frequency = Frequency::create($request->validated());

        return new FrequencyResource($frequency);
    }

    public function update(UpdateFrequencyRequest $request, $eventoId, $eventCallId, $frequencyId) {
        $frequency = Frequency::where('id', $frequencyId)
            ->whereHas('eventCall', function ($query) use ($eventCallId) {
                $query->where('id', $eventCallId);
            })
            ->whereHas('eventCall.evento', function ($query) use ($eventoId) {
                $query->where('id', $eventoId);
            })
            ->firstOrFail();

        $frequency->update($request->validated());
        return new FrequencyResource($frequency);
    }

}
