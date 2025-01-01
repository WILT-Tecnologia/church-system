<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
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
        $isCreating = $this->isMethod('post');
        return [
            'name' => $isCreating ? 'required|string|max:255' : 'nullable|string|max:255',
            'description' => $isCreating ? 'required|string|max:255' : 'nullable|string|max:255',
            'status' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            '*.required' => 'O campo :attribute é obrigatório.',
            '*.string' => 'O campo :attribute deve conter somente letras.',
            '*.max' => 'O campo :attribute deve ter no maximo :max caracteres.',
            '*.boolean' => 'O campo :attribute deve ser verdadeiro ou falso.',
            '*.exists' => 'O campo :attribute não existe.',
        ];
    }
}
