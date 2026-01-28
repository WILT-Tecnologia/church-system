<?php

namespace App\Http\Requests;

use App\Enums\CustomerSupplierEnum;
use App\Enums\EntryExitEnum;
use App\Enums\PaymentMethodEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreFinancialTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'church_id' => ['required', 'uuid', 'exists:churches,id'],
            'entry_exit' => ['required', new Enum(EntryExitEnum::class)],
            'customer_supplier' => ['required', new Enum(CustomerSupplierEnum::class)],
            'member_id' => ['nullable', 'uuid', 'exists:members,id'],
            'supplier_id' => ['nullable', 'uuid', 'exists:suppliers,id'],
            'person_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cat_financial_id' => ['required', 'uuid', 'exists:financial_categories,id'],
            'payment' => ['required', new Enum(PaymentMethodEnum::class)],
            'amount' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'amount_discount' => ['nullable', 'numeric', 'min:0'],
            'payment_date' => ['required', 'date'],
            'receipt' => ['nullable', 'string', 'max:255'],
        ];
    }
}
