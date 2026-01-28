<?php

namespace App\Http\Resources;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinancialTransactionResource extends JsonResource
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
            'church_id' => new ChurchResource($this->church),
            'entry_exit' => $this->entry_exit->value,
            'customer_supplier' => $this->customer_supplier->value,
            'member_id' => new MemberResource($this->whenLoaded('member')),
            'supplier_id' => new SupplierResource($this->whenLoaded('supplier')),
            'person_name' => $this->person_name,
            'description' => $this->description,
            'category_id' => new FinancialCategoryResource($this->financialCategory),
            'payment' => $this->payment->value,
            'amount' => $this->amount,
            'discount' => $this->discount,
            'amount_discount' => $this->amount_discount,
            'payment_date' => $this->payment_date?->format('Y-m-d'),
            'receipt' => $this->receipt,
            'created_at' => $this->created_at,
        ];
    }
}
