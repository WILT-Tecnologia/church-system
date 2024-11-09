<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFamilyRequest extends FormRequest
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
            'member_id' => ['required', 'exists:members,id'],
            'is_member' => ['boolean'],
            'person_id' => ['required_if:is_member,true', 'sometimes','nullable','exists:persons,id'],
            'name' => ['sometimes','nullable'],
            'kinship_id' => ['required', 'exists:aux_kinship,id'],
        ];
    }
}
