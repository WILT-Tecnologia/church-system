<?php

namespace App\Enums;

enum FormationEnum: string
{
    case ANALFABETO =  'Analfabeto';
    case LEESCREVE = 'Lê e Escreve';
    case FUNDAMENTALINCOMPLETO = 'Ensino Fudamental Incompleto';
    case FUNDAMENTALCOMPLETO = 'Ensino Fudamental Completo';
    case MEDIOINCOMPLETO = 'Ensino Médio Incompleto';
    case MEDIOCOMPLETO = 'Ensino Médio Completo';
    case SUPERIORINCOMPLETO = 'Superior Incompleto';
    case SUPERIORCOMPLETO = 'Superior Completo';
    case POSGRADUADO = 'Pós-Graduado';
    case MESTRADO = 'Mestrado';
    case DOUTORADO = 'Doutorado';
    case POSDOUTORADO = 'Pós-Doutorado';
}
