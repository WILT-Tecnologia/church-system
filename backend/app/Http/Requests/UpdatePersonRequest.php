<?php

namespace App\Http\Requests;

use App\Enums\SexEnum;
use App\Rules\Cpf;
use App\Rules\Phone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdatePersonRequest extends FormRequest
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
            'image' => ['nullable'],
            'name' => ['sometimes', 'requied'],
            'cpf' => ['sometimes', 'required', 'numeric', 'unique:persons,cpf', new Cpf()],
            'birth_date' => ['nullable', 'date'],
            'phone_one' => ['nullable', 'numeric', new Phone()],
            'sex' => ['sometimes', 'required', new Enum(SexEnum::class)],
            'cep' => ['nullable', 'numeric'],
            'street' => ['nullable', 'required_with:cep'],
            'number' => ['nullable', 'numeric', 'required_with:cep'],
            'complement' => ['nullable'],
            'district' => ['nullable', 'required_with:cep'],
            'city' => ['nullable', 'required_with:cep'],
            'state' => ['nullable', 'required_with:cep'],
            'country' => ['nullable', 'required_with:cep'],
        ];
    }
}
