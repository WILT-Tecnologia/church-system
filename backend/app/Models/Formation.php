<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formation extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'aux_formation';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'codigo',
        'name'
    ];

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }
}
