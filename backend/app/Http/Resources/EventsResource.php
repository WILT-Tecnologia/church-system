<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventsResource extends JsonResource
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
            'event_type' => new EventTypeResource($this->eventType),
            'name' => $this->name,
            'theme' => $this->theme,
            'obs' => $this->obs,
            'start_date' => $this->start_date ? Carbon::parse($this->start_date)->format('Y-m-d') : null,
            'end_date' => $this->end_date ? Carbon::parse($this->end_date)->format('Y-m-d') : null,
            'start_time' => $this->start_time ? Carbon::parse($this->start_time)->format('H:i') : null,
            'end_time' => $this->end_time ? Carbon::parse($this->end_time)->format('H:i') : null,
            'location' => $this->location,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'created_by' => new UserResource($this->createdBy),
            'updated_by' => new UserResource($this->updatedBy),
            'combinedCreatedByAndCreatedAt' => $this->created_at && $this->createdBy?->name
                ? Carbon::parse($this->created_at)->timezone('America/Sao_Paulo')->format('d/m/Y \à\s H:i:s') . ' por ' . $this->createdBy->name
                : '--',
            'combinedUpdatedByAndUpdatedAt' => $this->updated_at && $this->updatedBy?->name
                ? Carbon::parse($this->updated_at)->timezone('America/Sao_Paulo')->format('d/m/Y \à\s H:i:s') . ' por ' . $this->updatedBy->name
                : '--',
        ];
    }
}
