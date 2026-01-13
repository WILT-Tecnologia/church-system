<?php

namespace App\Enums;

enum PaymentMethodEnum: string
{
    case PIX = 'pix';
    case DINHEIRO = 'dinheiro';
    case BOLETO = 'boleto';
    case CREDITO = 'credito';
    case DEBITO = 'debito';
    case CHEQUE = 'cheque';
}
