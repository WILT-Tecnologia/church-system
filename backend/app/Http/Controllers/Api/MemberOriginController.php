<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMemberOriginRequest;
use App\Http\Requests\UpdateMemberOriginRequest;
use App\Http\Resources\MemberOriginResource;
use App\Models\MemberOrigin;
use Illuminate\Http\Request;

class MemberOriginController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() {
        $memberOrigin = MemberOrigin::orderBy('status', 'desc')->orderBy('name')->get();
        return MemberOriginResource::collection($memberOrigin);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMemberOriginRequest $request) {
        $memberOrigin = MemberOrigin::create($request->validated());

        return new MemberOriginResource($memberOrigin);
    }

    /**
     * Display the specified resource.
     */
    public function show(MemberOrigin $memberOrigin) {
        return new MemberOriginResource($memberOrigin);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMemberOriginRequest $request, MemberOrigin $memberOrigin) {
        $memberOrigin->update($request->validated());

        return new MemberOriginResource($memberOrigin);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MemberOrigin $memberOrigin) {
        $memberOrigin->delete();

        return response()->json([], 204);
    }
}
