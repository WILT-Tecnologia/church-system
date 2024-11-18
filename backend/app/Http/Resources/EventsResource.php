<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'church' => new ChurchResource($this->church),
            'event_type' => new EventTypeResource($this-> eventType),
            'name' => $this->name,
            'obs' => $this->obs,
        ];
    }
}
