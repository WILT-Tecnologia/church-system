<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'church'        => new ChurchResource($this->church),
            'name'          => $this->name,
            'type_supplier' => $this->type_supplier->value,
            'cpf_cnpj'      => $this->cpf_cnpj,
            'type_service'  => $this->type_service->value,
            'pix_key'       => $this->pix_key,
            'status'        => $this->status,
            'cep'           => $this->cep,
            'street'        => $this->street,
            'number'        => $this->number,
            'district'      => $this->district,
            'city'          => $this->city,
            'uf'            => $this->uf,
            'country'       => $this->country,
            'phone_one'     => $this->phone_one,
            'phone_two'     => $this->phone_two,
            'phone_three'   => $this->phone_three,
            'email'         => $this->email,
            'contact_name'  => $this->contact_name,
            'obs'           => $this->obs,
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,
        ];
    }
}
