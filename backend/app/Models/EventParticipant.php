<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventParticipant extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'event_participants';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'event_id',
        'member_id',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function evento(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Evento::class);
    }
}
