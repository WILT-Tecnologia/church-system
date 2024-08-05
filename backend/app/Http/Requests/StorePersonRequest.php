<?php

namespace App\Http\Requests;

use App\Enums\SexEnum;
use App\Models\Person;
use App\Rules\Cpf;
use App\Rules\Phone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StorePersonRequest extends FormRequest
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

        // dd("verificar o arquivo Handler de exception");
        return [
            'image' => ['nullable'],
            'name' => ['required'],
            'cpf' => ['required', 'numeric', "unique:persons,cpf", new Cpf()],
            'email' => ['nullable', 'email'],
            'birth_date' => ['nullable', 'date'],
            'phone_one' => ['nullable', 'numeric', new Phone()],
            'sex' => ['required', Rule::enum(SexEnum::class)],
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
