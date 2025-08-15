<?php

namespace App\Enums;

enum TypeEntryEnum: string
{
    case COMPRA = 'C';
    case DOACAO = 'D';
    case TRANSFERENCIA = 'T';

    public function label(): string
    {
        return match($this) {
            self::COMPRA => 'Compra',
            self::DOACAO => 'Doação',
            self::TRANSFERENCIA => 'Transferência',
        };
    }
}
