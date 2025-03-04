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
    public function index()
    {
        $families = Family::with('member')->get();

        return FamilyResource::collection($families);
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
    public function show($id)
    {
        $family = Family::with('member')->findOrFail($id);
        return new FamilyResource($family );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFamilyRequest $request, $id)
    {
        $family = Family::findOrFail($id);
        return new FamilyResource($family);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $family = Family::findOrFail($id);
        $family->delete();
        return response()->json(null, 204);
    }
}
