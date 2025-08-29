<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatrimonyRequest;
use App\Http\Requests\UpdatePatrimonyRequest;
use App\Http\Resources\PatrimonyResource;
use App\Models\Patrimony;
use Illuminate\Http\Request;

class PatrimonyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PatrimonyResource::collection(Patrimony::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePatrimonyRequest $request)
    {
        $patrimony = Patrimony::create($request->validated());

        return new PatrimonyResource($patrimony);
    }

    /**
     * Display the specified resource.
     */
    public function show(Patrimony $patrimony)
    {
        return new PatrimonyResource($patrimony);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePatrimonyRequest $request, Patrimony $patrimony)
    {
        $data = $request->validated();

        $patrimony->update($data);

        return new PatrimonyResource($patrimony);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patrimony $patrimony)
    {
        $patrimony->delete();

        return response()->noContent();
    }
}
