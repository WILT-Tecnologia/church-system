<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHistMemberRequest extends FormRequest
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
            'table_name' => ['sometimes', 'required'],
            'before_situation' => ['sometimes', 'nullable'],
            'after_situation' => ['sometimes', 'required'],
            'change_date' => ['sometimes', 'required', 'date_format:Y-m-d H:i:s'],
        ];
    }
}
