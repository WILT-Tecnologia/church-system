<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventType extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'event_types';

    protected $fillable = [
        'id',
        'name',
        'description',
        'status',
    ];
    
}
