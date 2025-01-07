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
            'member' => $this->when(
                $this->resource instanceof \App\Models\StatusMember && $this->relationLoaded('member'),
                fn() => new MemberResource($this->member),
                $this->member_id
            ),
            'member_situation' => new MemberSituationResource($this->memberSituation),
            'initial_period' => $this->initial_period,
            'final_period' => $this->final_period,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
