<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFamilyRequest extends FormRequest
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
            'member_id' => ['sometimes', 'required', 'exists:members,id'],
            'person_id' => ['sometimes', 'nullable', 'exists:persons,id'],
            'name' => ['sometimes', 'nullable'],
            'kinship' => ['sometimes', 'required']
        ];
    }
}
