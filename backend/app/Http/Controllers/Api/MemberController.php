<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Http\Resources\MemberResource;
use App\Http\Resources\OccupationResource;
use App\Http\Resources\OrdinationResource;
use App\Models\Member;
use App\Http\Resources\FamilyResource;
use Illuminate\Http\Request;
use Ramsey\Uuid\Uuid;

class MemberController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() {
        $members = Member::with([
            'person',
            'church',
            'church.responsible',
            'civilStatus',
            'colorRace',
            'formation',
            'statusMember',
            'families',
            'ordination',
            'memberOrigin'
        ])->get();

        return response()->json($members); //MemberResource::collection(Member::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMemberRequest $request) {
        $member = Member::create($request->validated());

        return new MemberResource($member);
    }

    /**
     * Display the specified resource.
     */
    public function show(Member $member) {
        return new MemberResource($member);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMemberRequest $request, Member $member) {
        $member->update($request->validated());

        return new MemberResource($member);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Member $member) {
        $member->delete();

        return response()->json([], 204);
    }
}
