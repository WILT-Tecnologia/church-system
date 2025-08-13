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
     /**
     * Display a listing of the resource.
     */
    public function index() {
        return FrequencyResource::collection(Frequency::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFrequencyRequest $request) {
        $frequency = Frequency::create($request->validated());

        return new FrequencyResource($frequency);
    }

    /**
     * Display the specified resource.
     */
    public function show(Frequency $frequency) {
        return new FrequencyResource(($frequency));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFrequencyRequest $request, Frequency $frequency) {
        $frequency->update($request->validated());

        return new FrequencyResource($frequency);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Frequency $frequency) {
        $frequency->delete();

        return response()->json([], 204);
    }
}
