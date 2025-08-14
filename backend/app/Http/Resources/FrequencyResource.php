<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FrequencyResource extends JsonResource
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
            'event_call' => $this->event_call_id,
            'member_id' => $this->member_id,
            'guest_id' => $this->guest_id,
            'present' => $this->present
        ];
    }
}
