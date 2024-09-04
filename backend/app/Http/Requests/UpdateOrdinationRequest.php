<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrdinationRequest extends FormRequest
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
            'member_id' => ['somtimes', 'required', 'exists:members,id'],
            'occupation_id' => ['somtimes', 'nullable', 'exists:occupations,id'],
            'status' => ['somtimes', 'boolean'],
            'initial_date' => ['somtimes', 'nullable', 'date'],
            'end_date' => ['somtimes', 'nullable', 'date']
        ];
    }
}
