<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyRequest extends FormRequest
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
            'name' => ['required'],
            'email' => ['required'],
            'cnpj' => ['required'],
            'cep' => ['required'],
            'street' => ['required'],
            'number' => ['required'],
            'complement' => ['required'],
            'district' => ['required'],
            'city' => ['required'],
            'state' => ['required'],
            'country' => ['required']
        ];
    }
}
