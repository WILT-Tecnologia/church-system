<?php

namespace App\Http\Requests;

use App\Enums\TypeServiceEnum;
use App\Enums\TypeSupplierEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Validator;

class UpdateSupplierRequest extends FormRequest
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
            'church_id'     => ['sometimes','required','uuid', 'exists:churches,id'],
            'name'          => ['sometimes','required'],
            'type_supplier' => ['sometimes','required', new Enum(TypeSupplierEnum::class)],
            'cpf_cnpj'      => ['sometimes','required', 'string' . $this->suplier->id],
            'type_service'  => ['sometimes','required', new Enum(TypeServiceEnum::class)],
            'pix_key'       => ['sometimes','nullable', 'string', 'max:255'],
            'status'        => ['sometimes','boolean'],
            'cep'           => ['sometimes','nullable','string','max:20'],
            'street'        => ['sometimes','nullable','string','max:255'],
            'number'        => ['sometimes','nullable','string','max:50'],
            'district'      => ['sometimes','nullable','string','max:100'],
            'city'          => ['sometimes','nullable','string','max:100'],
            'uf'            => ['sometimes','nullable','string','max:2'],
            'country'       => ['sometimes','nullable','string','max:100'],
            'phone_one'     => ['sometimes','nullable','string','max:20'],
            'phone_two'     => ['sometimes','nullable','string','max:20'],
            'phone_three'   => ['sometimes','nullable','string','max:20'],
            'email'         => ['sometimes','nullable','email','max:255'],
            'contact_name'  => ['sometimes','nullable','string','max:255'],
            'obs'           => ['sometimes','nullable','string'],
        ];
    }

    public function withValidator(Validator $validator)
    {
        $validator->after(function ($validator) {
            $type = $this->input('type_supplier');
            $cpfCnpj = preg_replace('/\D/', '', $this->input('cpf_cnpj'));

            if ($type === 'PF' && !$this->isValidCPF($cpfCnpj)) {
                $validator->errors()->add('cpf_cnpj', 'CPF inválido.');
            }

            if ($type === 'PJ' && !$this->isValidCNPJ($cpfCnpj)) {
                $validator->errors()->add('cpf_cnpj', 'CNPJ inválido.');
            }
        });
    }

    private function isValidCPF(string $cpf): bool
    {
        if (strlen($cpf) !== 11 || preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }

        for ($t = 9; $t < 11; $t++) {
            for ($d = 0, $c = 0; $c < $t; $c++) {
                $d += $cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ($cpf[$c] != $d) {
                return false;
            }
        }

        return true;
    }

    private function isValidCNPJ(string $cnpj): bool
    {
        if (strlen($cnpj) !== 14 || preg_match('/(\d)\1{13}/', $cnpj)) {
            return false;
        }

        $tamanho = [5, 6];
        for ($i = 0; $i < 2; $i++) {
            $soma = 0;
            $pos = $tamanho[$i];
            for ($j = 0; $j < $pos + 7; $j++) {
                $soma += $cnpj[$j] * $pos;
                $pos--;
                if ($pos < 2) $pos = 9;
            }

            $resultado = ($soma % 11) < 2 ? 0 : 11 - ($soma % 11);
            if ($cnpj[$pos + 7] != $resultado) {
                return false;
            }
        }

        return true;
    }

}
