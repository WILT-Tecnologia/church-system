<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CivilStatus extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'aux_civil_status';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'codigo',
        'name'
    ];
}
