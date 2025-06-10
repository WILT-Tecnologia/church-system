<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ordination extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'ordinations';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'member_id',
        'occupation_id',
        'status',
        'initial_date',
        'end_date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function occupation(): BelongsTo
    {
        return $this->belongsTo(Occupation::class);
    }
}
