<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Church extends Model
{
    use HasFactory;
    use SoftDeletes;
    use HasUuids;

    protected $table = 'churches';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'email',
        'cnpj',
        'cep',
        'street',
        'number',
        'complement',
        'district',
        'city',
        'state',
        'country',
    ];

}
