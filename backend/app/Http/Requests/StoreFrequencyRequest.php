<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFrequencyRequest extends FormRequest
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
            'event_call_id' => ['required', 'exists:event_calls,id'],
            'member_id' => ['sometimes', 'required', 'exists:members,id'],
            'guest_id' => ['sometimes', 'required', 'exists:persons,id'],
            'present' => ['boolean']
        ];
    }
}
