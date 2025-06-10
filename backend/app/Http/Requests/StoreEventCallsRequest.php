<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventCallsRequest extends FormRequest
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
            'event_id' => ['required', 'exists:events,id'],
            'theme' => ['nullable', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date'],
            'start_time' => ['required', 'regex:/^([01]\d|2[0-3]):([0-5]\d)$/'],
            'end_time' => ['required', 'regex:/^([01]\d|2[0-3]):([0-5]\d)$/', 'after:start_time'],
            'location' => ['nullable', 'string', 'max:255']
        ];
    }

    public function messages(): array {
        return [
            '*.required' => 'O campo :attribute é obrigatório.',
            '*.date' => 'O campo :attribute deve ser uma data.',
            '*.date_format' => 'O campo :attribute deve estar no formato HH:mm.',
            '*.max' => 'O campo :attribute deve ter no máximo :max caracteres.',
            '*.exists' => 'O campo :attribute selecionado é inválido.',
            '*.after' => 'O campo horário de término deve ser maior que o horário de início.',
            '*.string' => 'O campo :attribute deve ser um texto.',
            '*.regex' => 'O campo de hora deve estar no formato HH:mm.',
        ];
    }
}
