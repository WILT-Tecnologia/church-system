<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStatusMemberRequest extends FormRequest
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
            'member_situation_id' => ['sometimes', 'required', 'exists:aux_member_situation,id'],
            'initial_period' => ['sometimes', 'required', 'date'],
            'final_period' => ['sometimes', 'nullable', 'date']
        ];
    }
}
