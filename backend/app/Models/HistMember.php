<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HistMember extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'hist_members';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'table_name',
        'before_situation',
        'after_situation',
        'change_date'
    ];

}
