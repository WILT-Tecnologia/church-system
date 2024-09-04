<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrdinationRequest;
use App\Http\Requests\UpdateOrdinationRequest;
use App\Http\Resources\OrdinationResource;
use App\Models\Ordination;
use Illuminate\Http\Request;

class OrdinationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return OrdinationResource::collection(Ordination::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrdinationRequest $request)
    {
        $ordination = Ordination::create($request->validated());

        return new OrdinationResource($ordination);
    }

    /**
     * Display the specified resource.
     */
    public function show(Ordination $ordination)
    {
        return new OrdinationResource($ordination);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrdinationRequest $request, Ordination $ordination)
    {
        $ordination->update($request->validated());

        return new OrdinationResource($ordination);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ordination $ordination)
    {
        $ordination->delete();

        return response()->json([], 204);
    }
}
