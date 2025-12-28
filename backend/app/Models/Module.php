<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Module extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'module';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'context',
    ];
}
