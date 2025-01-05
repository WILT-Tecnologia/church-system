<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatusMemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'member_id' => new MemberResource($this->member),
            'member_situation' => new MemberSituationResource($this->memberSituation),
            'initial_period' => $this->initial_period,
            'final_period' => $this->final_period,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
