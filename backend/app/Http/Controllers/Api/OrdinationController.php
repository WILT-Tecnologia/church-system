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
        $ordination = Ordination::with('member')->get();

        return OrdinationResource::collection($ordination);
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
    public function show($id)
    {
        $ordination = Ordination::with('member')->findOrFail($id);

        return new OrdinationResource($ordination);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrdinationRequest $request, $id)
    {
        $ordination = Ordination::findOrFail($id);
        $ordination->update($request->validated());

        return new OrdinationResource($ordination);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ordination = Ordination::findOrFail($id);
        $ordination->delete();

        return response()->json([], 204);
    }
}
