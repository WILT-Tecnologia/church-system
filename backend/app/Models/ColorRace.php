<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ColorRace extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'aux_color_race';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'codigo',
        'name'
    ];
}
