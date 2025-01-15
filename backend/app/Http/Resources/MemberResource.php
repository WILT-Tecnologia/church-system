<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        // dd($this);
        return [
            'id' => $this->id,
            'person' => new PersonResource($this->person),
            'church' => new ChurchResource($this->church),
            // 'families' => FamilyResource::collection($this->whenLoaded('families')),
            'families' => FamilyResource::collection($this->families),
            'rg' => $this->rg,
            'issuing_body' => $this->issuing_body,
            'civil_status' => new CivilStatusResource($this->civilStatus),
            'nationality' => $this->nationality,
            'naturalness' => $this->naturalness,
            'color_race' => new ColorRaceResource($this->colorRace),
            'formation' => new FormationResource($this->formation),
            'formation_course' => $this->formation_course,
            'profission' => $this->profission,
            'def_physical' => $this->def_physical,
            'def_visual' => $this->def_mental,
            'def_hearing' => $this->def_hearing,
            'def_intellectual' => $this->def_intellectual,
            'def_mental' => $this->def_mental,
            'def_multiple' => $this->def_multiple,
            'def_other' => $this->def_other,
            'def_other_description' => $this->def_other_description,
            'baptism_date' => $this->baptism_date,
            'baptism_locale' => $this->baptism_locale,
            'baptism_official' => $this->baptism_official,
            'baptism_holy_spirit' => $this->baptism_holy_spirit,
            'baptism_holy_spirit_date' => $this->baptism_holy_spirit_date,
            'member_origin' => new MemberOriginResource($this->memberOrigin),
            'receipt_date' => $this->receipt_date,
            'ordination' => OrdinationResource::collection($this->ordination),
            'status_member' => new StatusMemberResource($this->whenLoaded('statusMember')),
            'history_member' => HistMemberResource::collection($this->histMembers),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
