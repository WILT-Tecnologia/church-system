<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Phone implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if(!validaCelularOuTelefone($value)) {
            $fail('O campo :attribute não é um número válido!');
        }
    }
}

function validaCelularOuTelefone($numero)
{
    // Remove todos os caracteres não numéricos do número
    $numeroLimpo = preg_replace('/[^0-9]/', '', $numero);

    // Verifica se o número possui a quantidade correta de dígitos
    if (strlen($numeroLimpo) < 10 || strlen($numeroLimpo) > 11) {
        return false;
    }

    // Verifica se o número começa com o dígito 9 (caso tenha 11 dígitos)
    if (strlen($numeroLimpo) == 11 && $numeroLimpo[2] !== '9') {
        return false;
    }

    // Verifica se todos os dígitos são iguais, o que indica um número inválido
    if (preg_match('/(\d)\1{9}/', $numeroLimpo)) {
        return false;
    }

    // A validação passou, o número é válido
    return true;
}

