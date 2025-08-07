<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventCallsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {

        return [
            'id' => $this->id,
            'church' => [
                'id' => $this->evento->church->id,
                'name' => $this->evento->church->name
            ],
            'event' => [
                'id' => $this->evento->id,
                'name' => $this->evento->name,
                'event_type' => $this->evento->eventType
            ],
            'theme' => $this->theme,
            'start_date' => $this->start_date ? Carbon::parse($this->start_date)->format('Y-m-d') : null,
            'end_date' => $this->end_date ? Carbon::parse($this->end_date)->format('Y-m-d') : null,
            'start_time' => $this->start_time ? Carbon::parse($this->start_time)->format('H:i') : null,
            'end_time' => $this->end_time ? Carbon::parse($this->end_time)->format('H:i') : null,
            'location' => $this->location,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
