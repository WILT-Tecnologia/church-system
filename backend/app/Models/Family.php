<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Family extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'families';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'member_id',
        'person_id',
        'name',
        'kinship_id'
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function kinship(): BelongsTo
    {
        return $this->belongsTo(Kinship::class);
    }
}
