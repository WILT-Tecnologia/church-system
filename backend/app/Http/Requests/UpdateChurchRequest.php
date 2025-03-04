<?php

namespace App\Http\Requests;

use App\Rules\Cnpj;
use Illuminate\Foundation\Http\FormRequest;

class UpdateChurchRequest extends FormRequest
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
            'responsible_id' => ['sometimes', 'nullable', 'exists:persons,id'],
            'name' => ['sometimes', 'required'],
            'email' => ['sometimes', 'required', 'email'],
            'cnpj' => ['sometimes', 'required', 'numeric', new Cnpj()],
            'cep' => ['sometimes', 'required', 'numeric'],
            'street' => ['sometimes', 'required'],
            'number' => ['sometimes', 'required', 'numeric'],
            'complement' => ['nullable'],
            'district' => ['sometimes', 'required'],
            'city' => ['sometimes', 'required'],
            'state' => ['sometimes', 'required'],
            'country' => ['sometimes', 'required'],
            'logo' => ['sometimes', 'nullable'],
            'favicon' => ['sometimes', 'nullable'],
            'background' => ['sometimes', 'nullable'],
            'color' => ['sometimes', 'nullable'],
        ];
    }
}
