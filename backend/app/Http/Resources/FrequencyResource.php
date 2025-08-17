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
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'present' => $this->present,
            'event_call' => [
                'id' => $this->eventCall->id ?? null,
                'start_date' => $this->eventCall->start_date ?? null,
                'start_time' => $this->eventCall->start_time ?? null,
                'end_date' => $this->eventCall->end_date ?? null,
                'end_time' => $this->eventCall->end_time ?? null,
                'evento' => [
                    'id' => $this->eventCall->evento->id ?? null,
                    'name' => $this->eventCall->evento->name ?? null,
                    'event_type' => $this->eventCall->evento->eventType ?? null,
                    'church' => $this->eventCall->evento->church ?? null,
                ]
            ],
            'member' => [
                'id' => $this->member->id ?? null,
                'name' => $this->member->name ?? null,
            ],
            'guest' => $this->guest ? [
                'id' => $this->guest->id,
                'name' => $this->guest->name ?? null,
            ] : null,
            /* 'id' => $this->id,
            'event_call' => $this->event_call_id,
            'member_id' => $this->member_id,
            'guest_id' => $this->guest_id,
            'present' => $this->present */
        ];
    }
}
