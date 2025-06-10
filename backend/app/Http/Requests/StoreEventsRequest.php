<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventsRequest extends FormRequest
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
            'church_id' => ['required', 'exists:churches,id'],
            'event_type_id' => ['required', 'exists:event_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'obs' => ['nullable', 'string', 'max:255'],
            'created_by' => ['nullable', 'exists:users,id'],
            'updated_by' => ['nullable', 'exists:users,id']
        ];
    }

    public function messages(): array {
        return [
            '*.required' => 'O campo :attribute é obrigatório.',
            '*.max' => 'O campo :attribute deve ter no máximo :max caracteres.',
            '*.exists' => 'O campo :attribute selecionado é inválido.',
            '*.string' => 'O campo :attribute deve ser um texto.',
        ];
    }
}
