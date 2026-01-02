<?php

namespace App\Http\Requests;

use App\Enums\TypeServiceEnum;
use App\Enums\TypeSupplierEnum;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;


class StoreSupplierRequest extends FormRequest
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
            'church_id'     => ['required','uuid', 'exists:churches,id'],
            'name'          => ['required'],
            'type_supplier' => ['required', new Enum(TypeSupplierEnum::class)],
            'cpf_cnpj'      => ['required', 'string'],
            'type_service'  => ['required', new Enum(TypeServiceEnum::class)],
            'pix_key'       => ['nullable', 'string', 'max:255'],
            'status'        => ['boolean'],
            'cep'           => ['nullable','string','max:20'],
            'street'        => ['nullable','string','max:255'],
            'number'        => ['nullable','string','max:50'],
            'district'      => ['nullable','string','max:100'],
            'city'          => ['nullable','string','max:100'],
            'uf'            => ['nullable','string','max:2'],
            'country'       => ['nullable','string','max:100'],
            'phone_one'     => ['nullable','string','max:20'],
            'phone_two'     => ['nullable','string','max:20'],
            'phone_three'   => ['nullable','string','max:20'],
            'email'         => ['nullable','email','max:255'],
            'contact_name'  => ['nullable','string','max:255'],
            'obs'           => ['nullable','string'],
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
    $cnpj = preg_replace('/\D/', '', $cnpj);

    if (strlen($cnpj) != 14 || preg_match('/(\d)\1{13}/', $cnpj)) {
        return false;
    }

    $b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    for ($i = 0, $n = 0; $i < 12; $i++) {
        $n += $cnpj[$i] * $b[$i + 1];
    }

    $d1 = ($n % 11 < 2) ? 0 : 11 - ($n % 11);
    if ($cnpj[12] != $d1) return false;

    for ($i = 0, $n = 0; $i < 13; $i++) {
        $n += $cnpj[$i] * $b[$i];
    }

    $d2 = ($n % 11 < 2) ? 0 : 11 - ($n % 11);
    return $cnpj[13] == $d2;
}

}
