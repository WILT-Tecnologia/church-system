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
        ])->get()->sortBy('person.name');

        return MemberResource::collection($members);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMemberRequest $request) {
        // Cria o membro com os dados validados
        $member = Member::create($request->validated());

        // Verifica se o campo church_ids existe na requisição
        if ($request->has('church_id')) {
            // Associa as igrejas ao membro
            $member->churches()->attach($request->church_id);
        }

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
        // Atualiza os dados do membro
        $member->update($request->validated());

        // Verifica se o campo church_ids existe na requisição
        if ($request->has('church_id')) {
            // Associa ou remove as igrejas associadas ao membro
            $member->churches()->sync($request->church_id);
        }

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
