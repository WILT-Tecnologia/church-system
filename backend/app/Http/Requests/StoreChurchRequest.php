<?php

namespace App\Http\Requests;

use App\Rules\Cnpj;
use Illuminate\Foundation\Http\FormRequest;

class StoreChurchRequest extends FormRequest
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
            'email' => ['required', 'email'],
            'cnpj' => ['required', new Cnpj](),
            'cep' => ['required'],
            'street' => ['required'],
            'number' => ['required', 'numeric'],
            'complement' => ['nullable'],
            'district' => ['required'],
            'city' => ['required'],
            'state' => ['required'],
            'country' => ['required']
        ];
    }
}
