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
        $histMember = HistMember::with('member')->get();

        return HistMemberResource::collection($histMember);
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
    public function show($id)
    {
        $histMember = HistMember::with('member')->findOrFail($id);

        return new HistMemberResource($histMember);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateHistMemberRequest $request, $id)
    {
        $histMember = HistMember::findOrFail($id);
        $histMember->update($request->validated());

        return new HistMemberResource($histMember);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $histMember = HistMember::findOrFail($id);
        $histMember->delete();

        return response()->json([], 204);
    }
}
