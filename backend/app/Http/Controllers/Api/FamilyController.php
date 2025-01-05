<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFamilyRequest;
use App\Http\Requests\UpdateFamilyRequest;
use App\Http\Resources\FamilyResource;
use App\Models\Family;
use Illuminate\Http\Request;

class FamilyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() {
        return FamilyResource::collection(Family::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFamilyRequest $request) {
        $family = Family::create($request->validated());

        return new FamilyResource($family);
    }

    /**
     * Display the specified resource.
     */
    public function show(Family $family) {
        return new FamilyResource($family);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFamilyRequest $request, Family $family) {
        $family->update($request->validated());

        return new FamilyResource($family);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Family $family) {
        $family->delete();

        return response()->json([], 204);
    }
}
