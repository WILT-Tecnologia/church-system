<?php

namespace App\Models;

use App\Enums\SexEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Person extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'persons';

    protected $fillable = [
        'image',
        'name',
        'cpf',
        'birt_date',
        'email',
        'phone_one',
        'phone_two',
        'sex',
        'cep',
        'street',
        'number',
        'complement',
        'district',
        'city',
        'state',
        'country'
    ];

    protected $cats = [
        'sex' => SexEnum::class,
    ];
}
