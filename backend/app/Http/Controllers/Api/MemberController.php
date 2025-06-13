<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Http\Resources\MemberResource;
use App\Models\Member;

class MemberController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index() {
        $members = Member::with(['families', 'ordination', 'statusMember', 'histMembers'])->get();
        return MemberResource::collection($members);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMemberRequest $request) {
        $member = Member::create($request->validated());

        // Verifica se o campo church_ids existe na requisição
        if ($request->has('church_id')) {
            $member->churches()->attach($request->church_id);
        }

        return new MemberResource($member);
    }

    /**
     * Display the specified resource.
     */
    public function show($id) {
        $member = Member::with(['families', 'ordination', 'statusMember', 'histMembers'])->findOrFail($id);
        return new MemberResource($member);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMemberRequest $request, $id) {
        $member = Member::findOrFail($id);
        $member->update($request->validated());

        if ($request->has('church_ids')) {
            $member->churches()->syncWithoutDetaching($request->church_id);
        }

        return new MemberResource($member);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {
        $member = Member::findOrFail($id);
        $member->delete();
        return response()->json(null, 204);
    }
}
