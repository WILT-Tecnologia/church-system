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
    public function index()
    {
        $members = Member::with(['families', 'ordination'])->get();
        return MemberResource::collection($members);
    }

//     public function findFamilyPerMember(Request $request)
// {
//     $memberId = $request->query('member_id');

//     if (!$memberId || !Uuid::isValid($memberId)) {
//         return response()->json(['error' => 'ID de membro inválido'], 400);
//     }

//     $member = Member::with(['families', 'person', 'families.kinship'])->find($memberId);

//     if (!$member) {
//         return response()->json(['error' => 'Membro não encontrado'], 404);
//     }

//     return FamilyResource::collection($member->families);
// }

//     public function findOrdinationPerMember(Request $request)
// {
//     $memberId = $request->query('member_id');

//     if (!$memberId || !Uuid::isValid($memberId)) {
//         return response()->json(['error' => 'ID de membro inválido'], 400);
//     }

//     $member = Member::with(['ordination','ordination.member','ordination.occupation'])->find($memberId);

//     if (!$member) {
//         return response()->json(['error' => 'Membro não encontrado'], 404);
//     }

//     return OrdinationResource::collection($member->ordination);
// }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMemberRequest $request)
    {
        $member = Member::create($request->all());
        return new MemberResource($member);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $member = Member::with('families')->findOrFail($id);
        return new MemberResource($member);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMemberRequest $request, Member $id)
    {
        $member = Member::findOrFail($id);
        $member->update($request->validated());
        return new MemberResource($member);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $member = Member::findOrFail($id);
        $member->delete();
        return response()->json(null, 204);
    }
}
