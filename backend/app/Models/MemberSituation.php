<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MemberSituation extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'aux_member_situation';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'codigo',
        'name',
    ];

    public function statusMembers(): HasMany
    {
        return $this->hasMany(StatusMember::class);
    }
}
