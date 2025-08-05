<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOccupationRequest;
use App\Http\Requests\UpdateOccupationRequest;
use App\Http\Resources\OccupationResource;
use App\Models\Occupation;
use Illuminate\Http\Request;

class OccupationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() {
        $occupations = Occupation::orderBy('status', 'desc')->orderBy('name')->get();
        return OccupationResource::collection($occupations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOccupationRequest $request) {
        $occupation = Occupation::create($request->validated());

        return new OccupationResource($occupation);
    }

    /**
     * Display the specified resource.
     */
    public function show(Occupation $occupation) {
        return new OccupationResource($occupation);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOccupationRequest $request, Occupation $occupation) {
        $occupation->update($request->validated());

        return new OccupationResource($occupation);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Occupation $occupation) {
        $occupation->delete();

        return response()->json([], 204);
    }
}
