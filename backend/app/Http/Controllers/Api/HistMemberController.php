<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHistMemberRequest;
use App\Http\Requests\UpdateHistMemberRequest;
use App\Http\Resources\HistMemberResource;
use App\Models\HistMember;
use Illuminate\Http\Request;

class HistMemberController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return HistMemberResource::collection(HistMember::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreHistMemberRequest $request)
    {
        $histMember = HistMember::create($request->validated());

        return new HistMemberResource($histMember);
    }

    /**
     * Display the specified resource.
     */
    public function show(HistMember $histMember)
    {
        return new HistMemberResource($histMember);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateHistMemberRequest $request, HistMember $histMember)
    {
        $histMember->update($request->validated());

        return new HistMemberResource($histMember);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HistMember $histMember)
    {
        $histMember->delete();

        return response()->json([], 204);
    }
}
