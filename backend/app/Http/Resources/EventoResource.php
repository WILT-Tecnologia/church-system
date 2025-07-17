<?php

namespace App\Http\Resources;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'church' => new ChurchResource($this->church),
            'eventType' => new EventTypeResource($this->eventType),
            'name' => $this->name,
            'obs' => $this->obs,
            'participants' => MemberResource::collection($this->whenLoaded('participantes')),
            'guests' => GuestResource::collection($this->guests) ,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
