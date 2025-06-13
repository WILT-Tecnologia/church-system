<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MemberOrigin extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'member_origins';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'name',
        'description',
        'status'
    ];

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }
}
