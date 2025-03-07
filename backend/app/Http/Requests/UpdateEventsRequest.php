<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'church_id' => ['sometimes', 'required', 'exists:churches,id'],
            'event_type_id' => ['sometimes', 'required', 'exists:event_types,id'],
            'name' => ['sometimes', 'required'],
            'obs' => ['sometimes', 'nullable'],
            'theme' => ['sometimes', 'nullable'],
            'start_date' => ['sometimes'],
            'end_date' => ['sometimes'],
            'start_time' => ['required', 'regex:/^([01]\d|2[0-3]):([0-5]\d)$/'],
            'end_time' => ['required', 'regex:/^([01]\d|2[0-3]):([0-5]\d)$/', 'after:start_time'],
            'location' => ['sometimes', 'nullable'],
            'created_by' => ['nullable', 'exists:users,id'],
            'updated_by' => ['nullable', 'exists:users,id']
        ];
    }

    public function messages(): array {
        return [
            '*.required' => 'O campo :attribute é obrigatório.',
            '*.date' => 'O campo :attribute deve ser uma data.',
            '*.date_format' => 'O campo :attribute deve estar no formato HH:mm.',
            '*.max' => 'O campo :attribute deve ter no máximo :max caracteres.',
            '*.exists' => 'O campo :attribute selecionado é inválido.',
            '*.after' => 'O campo horário de término deve ser maior que o horário de início.',
        ];
    }
}
