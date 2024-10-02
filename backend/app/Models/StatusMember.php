<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StatusMember extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'status_member';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'member_id',
        'member_situation_id',
        'initial_period',
        'final_period',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function memberSituation(): BelongsTo
    {
        return $this->belongsTo(MemberSituation::class);
    }
}
