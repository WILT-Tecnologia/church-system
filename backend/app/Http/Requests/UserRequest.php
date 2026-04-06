<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
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
        $isCreating = $this->isMethod('post');
        $userId = $this->route('user') ?? $this->route('id') ?? $this->input('id');

        return [
            'name' => ($isCreating ? 'required' : 'sometimes') . '|string|max:255',
            'email' => [
                $isCreating ? 'required' : 'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => $isCreating 
                ? 'required|string|min:8|max:30|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/' 
                : 'sometimes|nullable|string|min:8|max:30',
            'status' => 'sometimes|boolean',
            'change_password' => 'sometimes|boolean',
            'profile_id' => [
                $isCreating ? 'required' : 'sometimes',
                'uuid',
                Rule::exists('profile', 'id')
            ],
        ];
    }

    public function messages(): array {
        return [
            '*.required' => 'O campo :attribute é obrigatório.',
            '*.email' => 'O campo :attribute é inválido.',
            '*.string' => 'O campo :attribute deve ser uma string.',
            '*.max' => 'O campo :attribute deve ter no maximo :max caracteres.',
            '*.regex' => 'O campo :attribute deve ser uma string com pelo menos uma letra minúscula, uma letra maiúscula, um número e um caractere especial [@, $, !, %, *, ?, &].',
            '*.min' => 'O campo :attribute deve ter pelo menos :min caracteres.',
            '*.unique' => 'O campo :attribute já está sendo usado por outro usuário.',
            '*.boolean' => 'O campo :attribute deve ser verdadeiro ou falso.',
        ];
    }
}
