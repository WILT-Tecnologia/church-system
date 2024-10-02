<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStatusMemberRequest;
use App\Http\Requests\UpdateStatusMemberRequest;
use App\Http\Resources\StatusMemberResource;
use App\Models\StatusMember;
use Illuminate\Http\Request;

class StatusMemberController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return StatusMemberResource::collection(StatusMember::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStatusMemberRequest $request)
    {
        $statusMember = StatusMember::create($request->validated());

        return new StatusMemberResource($statusMember);
    }

    /**
     * Display the specified resource.
     */
    public function show(StatusMember $statusMember)
    {
        return new StatusMemberResource($statusMember);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStatusMemberRequest $request, StatusMember $statusMember)
    {
        $statusMember->update($request->validated());

        return new StatusMemberResource($statusMember);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StatusMember $statusMember)
    {
        $statusMember->delete();
        
        return response()->json([], 204);
    }
}
