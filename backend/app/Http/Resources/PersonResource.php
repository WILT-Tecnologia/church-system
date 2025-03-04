<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->user),
            'image' => $this->image,
            'name' => $this->name,
            'cpf' => $this->cpf,
            'birth_date' => $this->birth_date,
            'email' => $this->email,
            'phone_one' => $this->phone_one,
            'phone_two' => $this->phone_two,
            'sex' => $this->sex,
            'cep' => $this->cep,
            'street' => $this->street,
            'number' => $this->number,
            'complement' => $this->complement,
            'district' => $this->district,
            'city' => $this->city,
            'state' => $this->state,
            'country' => $this->country,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
