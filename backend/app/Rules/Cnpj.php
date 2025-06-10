<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Cnpj implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $c = preg_replace('/\D/', '', $value);

        $b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        $erro = false;

        if (strlen($c) != 14) {

            $erro = true;
        } elseif (preg_match("/^{$c[0]}{14}$/", $c) > 0) {

            $erro = true;
        }

        for ($i = 0, $n = 0; $i < 12; $n += intval($c[$i]) * $b[++$i]);

        if ($c[12] != ((($n %= 11) < 2) ? 0 : 11 - $n)) {
            $erro = true;
        }

        for ($i = 0, $n = 0; $i <= 12; $n += intval($c[$i]) * $b[$i++]);

        if ($c[13] != ((($n %= 11) < 2) ? 0 : 11 - $n)) {
            $erro = true;
        }

        if ($erro == true) {
            $fail('O campo :attribute não é um CNPJ válido!');
        }
    }
}
