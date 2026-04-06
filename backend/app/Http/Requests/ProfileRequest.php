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
        $profileId = $this->route('profile') ?? $this->route('id');

        return [
            'name' => ($isCreating ? 'required' : 'sometimes') . '|string|max:255|unique:profile,name,' . $profileId,
            'description' => 'nullable|string|max:255',
            'status' => 'sometimes|boolean',
            'modules' => ($isCreating ? 'required' : 'sometimes') . '|array|min:1',
            'modules.*' => [
                'required',
                'array',
                function ($attribute, $value, $fail) {
                    $hasPermission = ($value['can_read'] ?? false) || 
                                     ($value['can_write'] ?? false) || 
                                     ($value['can_delete'] ?? false);
                    if (!$hasPermission) {
                        $fail('Cada módulo selecionado deve ter ao menos uma permissão (Leitura, Escrita ou Exclusão).');
                    }
                },
            ],
            'modules.*.module_id' => 'required|exists:module,id',
            'modules.*.can_read' => 'boolean',
            'modules.*.can_write' => 'boolean',
            'modules.*.can_delete' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'modules.required' => 'Selecione ao menos um módulo e uma permissão.',
            'modules.min' => 'Selecione ao menos um módulo e uma permissão.',
            '*.required' => 'O campo :attribute é obrigatório.',
            '*.string' => 'O campo :attribute deve conter somente letras.',
            '*.max' => 'O campo :attribute deve ter no maximo :max caracteres.',
            '*.boolean' => 'O campo :attribute deve ser verdadeiro ou falso.',
        ];
    }
}
