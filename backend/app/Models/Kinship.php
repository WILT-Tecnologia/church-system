<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kinship extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'aux_kinship';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'codigo',
        'name'
    ];

    public function families(): HasMany
    {
        return $this->hasMany(Kinship::class);
    }
}
