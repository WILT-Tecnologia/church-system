<?php

namespace App\Enums;

enum TypeServiceEnum: string
{
    case PRODUTO = 'Produto';
    case SERVIÇO = 'Serviço';
    case AMBOS = 'Ambos';
}
