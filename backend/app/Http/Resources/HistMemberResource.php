<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistMemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'member' => new MemberResource($this->whenLoaded('member')),
            'table_name' => $this->table_name,
            'before_situation' => $this->before_situation,
            'after_situation' => $this->after_situation,
            'change_date' => $this->change_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
