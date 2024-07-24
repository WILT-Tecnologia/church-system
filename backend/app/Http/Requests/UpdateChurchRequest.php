<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChurchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required'],
            'email' => ['sometimes', 'required', 'email'],
            'cnpj' => ['sometimes', 'required'],
            'cep' => ['sometimes', 'required'],
            'street' => ['sometimes', 'required'],
            'number' => ['sometimes', 'required', 'numeric'],
            'complement' => ['nullable'],
            'district' => ['sometimes', 'required'],
            'city' => ['sometimes', 'required'],
            'state' => ['sometimes', 'required'],
            'country' => ['sometimes', 'required']
        ];
    }
}
