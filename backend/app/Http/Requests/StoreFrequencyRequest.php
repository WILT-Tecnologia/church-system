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
            'member_id' => ['nullable', 'exists:members,id'],
            'guest_id' => ['nullable', 'exists:persons,id'],
            'present' => ['boolean']
        ];
    }
}
