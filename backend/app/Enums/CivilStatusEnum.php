<?php

namespace App\Enums;

enum CivilStatusEnum: string
{
    case CASADO = 'Casado(a)';
    case DIVORCIADO = 'Divorciado(a)';
    case SEPARADO = 'Separado(a)';
    case SOLTEIRO = 'Solteiro(a)';
    case VIUVO = 'Viúvo(a)';
}
